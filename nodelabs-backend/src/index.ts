import "dotenv/config";
import mongoose from "mongoose";
import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

import { startSocketServer } from "@/socket";
import { RedisClient } from "@/redis";
import { container } from "@/container";
import { RabbitMQClient } from "./queue";
import { createApp } from "@/http";
import { Message } from "@/message/model";
import { Conversation } from "@/conversation/model";
import { AutoMessage } from "@/automessage/model";

const port = process.env.PORT ?? 5000;
const socket_port = (process.env.SOCKET_PORT as unknown as number) ?? 5001;
const mongo_url = process.env.MONGO_URL ?? "mongodb://localhost:27017";
const redis_url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

const app = createApp();
const server = startSocketServer(app, socket_port);

const init = async (): Promise<boolean> => {
  let status = true;

  const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  });

  const logger = winston.createLogger({
    level: "info",
    format: combine(colorize(), timestamp(), myFormat),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "chat-application.log" }),
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: "exceptions.log" }),
    ],
  });

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
  container.logger = logger;

  try {
    container.mongoConnection = await mongoose.connect(mongo_url);
    container.logger.info("MongoDB connection is successful.");

    container.redisClient = await RedisClient.getInstance(redis_url);
    container.logger.info("Redis connection is successful.");

    const rabbitMQClient = new RabbitMQClient(
      process.env.RABBITMQ_URL ?? "amqp://localhost:5672"
    );
    await rabbitMQClient.connect();
    await rabbitMQClient.createQueue("message_sending_queue");
    await rabbitMQClient.consume("message_sending_queue", async (msg) => {
      async function getConversationId(user1: string, user2: string) {
        let conversation = await Conversation.findOne({
          participants: { $all: [user1, user2], $size: 2 },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [user1, user2],
          });
        }

        return conversation._id;
      }

      const autoMessage = JSON.parse(msg.content.toString());

      const message = await Message.create({
        conversation: await getConversationId(
          autoMessage.sender,
          autoMessage.receiver
        ),
        sender: autoMessage.sender,
        content: autoMessage.content,
        readBy: [autoMessage.sender],
      });

      await Conversation.findOneAndUpdate(
        { _id: message.conversation },
        { lastMessage: message._id }
      );

      const isOnline = await container.redisClient.sIsMember(
        "online_users",
        autoMessage.receiver
      );

      if (isOnline) {
        container.socketServer
          .to(`user_${autoMessage.receiver}`)
          .emit("message_received", {
            conversationId: message.conversation,
            message,
          });
      }

      await AutoMessage.findByIdAndUpdate(autoMessage._id, { isSent: true });
    });
    container.rabbitmqClient = rabbitMQClient;
    container.logger.info("RabbitMQ connection is successful.");

    await import("@/cron");
  } catch (err) {
    container.logger.error(err);
    status = false;
  } finally {
    return status;
  }
};

server.listen(port, async () => {
  const status = await init();
  if (!status) {
    container.logger.error("Exiting...");
    process.exit(1);
  }
  container.logger.info(`HTTP server run on port: ${port}`);
});

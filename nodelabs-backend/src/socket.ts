import { createServer, Server as HTTPServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { NodeLabsError } from "@/common/errors";
import { User, UserDocument } from "@/user/model";
import { Conversation, ConversationDocument } from "@/conversation/model";
import { createConversation } from "./conversation/service";
import { container } from "@/container";
import { Message, MessageDocument } from "./message/model";

const startSocketServer = (
  app: Express.Application,
  port: number
): HTTPServer => {
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  container.socketServer = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new NodeLabsError(`Invalid Request.`, 400);

      const decoded = jwt.verify(token, process.env.ACCESS_SECRET as string);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new NodeLabsError("Token verify unsuccessful.", 401));
    }
  });

  io.on("connection", async (socket) => {
    const connectedUser = socket.data.user as UserDocument;
    const userId = connectedUser._id.toString();
    await User.findByIdAndUpdate(userId, {
      isActive: true,
      lastActiveAt: new Date(),
    });

    const heartbeatInterval = setInterval(
      async () => {
        await User.findByIdAndUpdate(userId, {
          lastActiveAt: new Date(),
        });
      },
      2 * 60 * 1000
    );

    socket.join(`user_${userId}`);
    await container.redisClient.SADD("online_users", userId);
    await container.redisClient.HSET("user_sockets", userId, socket.id);
    socket.broadcast.emit("user_online", userId);

    socket.on(
      "join_room",
      async (
        conversationId: string | null,
        participants: string[] = [],
        callback: (response: {
          success: boolean;
          conversation?: ConversationDocument;
          error?: string;
        }) => void
      ) => {
        try {
          const userId = socket.data.user._id.toString();
          let conversation: ConversationDocument | null = null;

          if (conversationId) {
            conversation = await Conversation.findOne({
              _id: conversationId,
              participants: { $in: [userId] },
            });

            if (!conversation) {
              return callback({
                success: false,
                error: "Conversation not found or access denied",
              });
            }
          } else {
            if (participants.length === 0) {
              return callback({
                success: false,
                error: "At least one participant required",
              });
            }
            const allParticipants = [...new Set([userId, ...participants])];
            const existingUsers = await User.countDocuments({
              _id: { $in: allParticipants },
            });
            if (existingUsers !== allParticipants.length) {
              return callback({
                success: false,
                error: "One or more users not found",
              });
            }
            conversation = await createConversation({
              participants: allParticipants,
            });
          }
          socket.join(`conversation_${conversation._id}`);
          await container.redisClient
            .multi()
            .SADD(`conversation:${conversation._id}:members`, userId)
            .HSET(
              `user:${userId}:conversations`,
              conversation._id.toString(),
              new Date().toISOString()
            )
            .exec();

          conversation.participants.forEach((participant) => {
            if (participant._id.toString() !== userId) {
              socket.to(`user_${participant._id}`).emit("conversation_update", {
                type: conversationId ? "user_joined" : "conversation_created",
                conversation: conversation!.toObject(),
                userId,
              });
            }
          });
          callback({
            success: true,
            conversation: conversation,
          });
        } catch (error) {
          container.logger.error("Error joining conversation:", error);
          callback({
            success: false,
            error: "Internal server error",
          });
        }
      }
    );

    socket.on(
      "send_message",
      async (
        {
          conversationId,
          content,
        }: {
          conversationId: string;
          content: string;
        },
        callback: (response: {
          success: boolean;
          message?: MessageDocument;
          error?: string;
        }) => void
      ) => {
        try {
          const userId = socket.data.user._id.toString();

          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: { $in: [userId] },
          }).populate("participants");

          if (!conversation) {
            return callback({
              success: false,
              error: "Conversation not found or access denied",
            });
          }

          const message = await Message.create({
            conversation: conversationId,
            sender: userId,
            content,
            readBy: [userId],
          });

          conversation.lastMessage = message._id;
          await conversation.save();

          const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username")
            .lean()
            .exec();

          conversation.participants.forEach((participant) => {
            const participantId = participant._id.toString();

            if (participantId === userId) {
              socket.emit("message_delivered", {
                conversationId,
                message: populatedMessage,
              });
            } else {
              socket.to(`user_${participantId}`).emit("receive_message", {
                conversationId,
                message: populatedMessage,
              });
            }
          });

          callback({
            success: true,
            message: populatedMessage as MessageDocument,
          });
        } catch (error) {
          container.logger.error("Error sending message:", error);
          callback({
            success: false,
            error: "Failed to send message",
          });
        }
      }
    );

    socket.on(
      "receive_message",
      async (
        {
          conversationId,
          messageId,
        }: { conversationId: string; messageId: string },
        callback: (success: boolean) => void
      ) => {
        try {
          const userId = socket.data.user._id.toString();

          await Message.findByIdAndUpdate(messageId, {
            $addToSet: { readBy: userId },
          });

          socket.to(`conversation_${conversationId}`).emit("message_read", {
            userId,
            conversationId,
            messageId,
            timestamp: new Date(),
          });

          callback(true);
        } catch (error) {
          container.logger.error("Error marking message as read:", error);
          callback(false);
        }
      }
    );

    socket.on("typing_start", async (conversationId: string) => {
      const userId = socket.data.user._id.toString();

      const isParticipant = await Conversation.exists({
        _id: conversationId,
        participants: { $in: [userId] },
      });

      if (isParticipant) {
        socket.to(`conversation_${conversationId}`).emit("user_typing", {
          userId,
          conversationId,
          isTyping: true,
        });

        await container.redisClient.SETEX(
          `typing:${userId}:${conversationId}`,
          5,
          "true"
        );
      }
    });

    socket.on("typing_stop", async (conversationId: string) => {
      const userId = socket.data.user._id.toString();
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId,
        conversationId,
        isTyping: false,
      });

      await container.redisClient.DEL(`typing:${userId}:${conversationId}`);
    });

    socket.on("disconnect", async () => {
      try {
        clearInterval(heartbeatInterval);
        await User.findByIdAndUpdate(userId, {
          lastActiveAt: new Date(),
        });
        await container.redisClient
          .multi()
          .SREM("online_users", userId)
          .DEL(`user_sockets:${userId}`)
          .exec();
        io.emit("user_offline", userId);
      } catch (error) {
        container.logger.error("Disconnection cleanup error:", error);
      }
    });
  });

  return server;
};

export { startSocketServer };

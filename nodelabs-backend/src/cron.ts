import { AutoMessage } from "@/automessage/model";
import { CronJob } from "cron";
import { User } from "@/user/model";
import { container } from "./container";

const messagePlanningFunc = async () => {
  try {
    container.logger.info("Running message planning job...");

    const activeUsers = await User.find({ isActive: true });

    if (activeUsers.length < 2) {
      container.logger.info("Not enough active users to create messages.");
      return;
    }

    const shuffledUsers = [...activeUsers].sort(() => 0.5 - Math.random());

    for (let i = 0; i < shuffledUsers.length; i += 2) {
      if (i + 1 >= shuffledUsers.length) break;

      const sender = shuffledUsers[i];
      const receiver = shuffledUsers[i + 1];

      const messages = [
        "Hope you're having a great day!",
        "Let's catch up soon!",
        "Random act of messaging!",
        "How's everything going?",
      ];
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];

      const deliveryHour = 8 + Math.floor(Math.random() * 3);
      const sendDate = new Date();
      sendDate.setHours(deliveryHour, 0, 0, 0);

      // Fix possibly null sender, receiver
      await AutoMessage.create({
        sender: sender?._id,
        receiver: receiver?._id,
        content: randomMessage,
        sendDate,
        isQueued: false,
        isSent: false,
      });
    }

    container.logger.info(
      `Created ${Math.floor(shuffledUsers.length / 2)} message pairs`
    );
  } catch (error) {
    container.logger.error("Error in message planning job:", error);
  }
};

const messagePlanningJob = CronJob.from({
  cronTime: "0 2 * * *",
  onTick: messagePlanningFunc,
  start: true,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

const queueManagementFunc = async () => {
  try {
    const now = new Date();

    const messagesToQueue = await AutoMessage.find({
      sendDate: { $lte: now },
      isQueued: false,
    });

    if (messagesToQueue.length > 0) {
      container.logger.info(`Queueing ${messagesToQueue.length} messages...`);

      for (const message of messagesToQueue) {
        await container.rabbitmqClient.sendToQueue(
          "message_sending_queue",
          Buffer.from(JSON.stringify(message))
        );

        await AutoMessage.findByIdAndUpdate(message._id, { isQueued: true });
      }
    }
  } catch (error) {
    container.logger.error("Error in queue management job:", error);
  }
};

const queueManagementJob = CronJob.from({
  cronTime: "* * * * *",
  onTick: queueManagementFunc,
  start: true,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

export { messagePlanningJob, queueManagementJob };

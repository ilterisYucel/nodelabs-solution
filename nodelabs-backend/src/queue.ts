import amqp from "amqplib";
import { container } from "@/container";

interface FixedConnection {
  createChannel(): Promise<amqp.Channel>;
  createConfirmChannel?(): Promise<amqp.ConfirmChannel>;
  close(): Promise<void>;
}

export class RabbitMQClient {
  private connection!: FixedConnection;
  private channel!: amqp.Channel;

  constructor(private url: string) {}

  async connect() {
    try {
      const rawConnection = await amqp.connect(this.url);
      this.connection = rawConnection as unknown as FixedConnection;
      this.channel = await this.connection.createChannel();
    } catch (error) {
      container.logger.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async createQueue(queueName: string) {
    if (!this.channel) throw new Error("Not connected to RabbitMQ");
    await this.channel.assertQueue(queueName, { durable: true });
  }

  async sendToQueue(queueName: string, message: any) {
    const msgBuffer = Buffer.from(JSON.stringify(message));
    this.channel.sendToQueue(queueName, msgBuffer, { persistent: true });
  }

  async consume(queueName: string, callback: (msg: any) => void) {
    await this.channel.consume(queueName, (msg) => {
      if (msg !== null) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }

  async close() {
    await this.channel.close();
    await this.connection.close();
  }
}

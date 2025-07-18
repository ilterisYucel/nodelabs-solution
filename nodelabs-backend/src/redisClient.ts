import { createClient, RedisClientType } from "redis";
import { container } from "@/container";

// Define the client type using ReturnType
export class RedisClient {
  private static instances: Map<string, RedisClientType> = new Map();

  private constructor() {}

  public static async getInstance(
    connectionString: string
  ): Promise<RedisClientType> {
    if (!RedisClient.instances.has(connectionString)) {
      const client = createClient({ url: connectionString });
      client.on("error", (err: any) =>
        container.logger.error(`Redis Client ${connectionString} Error: ${err}`)
      );

      RedisClient.instances.set(connectionString, client as RedisClientType);

      try {
        await client.connect();
        container.logger.info(
          `Created new Redis connection for ${connectionString}`
        );
      } catch (error) {
        RedisClient.instances.delete(connectionString);
        throw error;
      }
    }

    return RedisClient.instances.get(connectionString)!;
  }

  public static async checkOnlineStatus(
    connectionString: string,
    userId: string
  ): Promise<boolean> {
    const client = await RedisClient.getInstance(connectionString);
    const result = await client.sIsMember("online_users", userId);
    return Boolean(result);
  }

  public static async getOnlineUsers(
    connectionString: string
  ): Promise<string[]> {
    const client = await RedisClient.getInstance(connectionString);
    return await client.sMembers("online_users");
  }

  public static async disconnectAll(): Promise<void> {
    for (const [connectionString, client] of RedisClient.instances) {
      await client.quit();
      container.logger.info(
        `Disconnected Redis client for ${connectionString}`
      );
    }
    RedisClient.instances.clear();
  }
}

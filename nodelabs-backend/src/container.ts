import mongoose from "mongoose";
import { RedisClientType } from "redis";
import { RabbitMQClient } from "@/queue";
import winston from "winston";
import { Server } from "socket.io";

class DependencyContainer {
  private static instance: DependencyContainer;
  private _mongoConnection?: typeof mongoose;
  private _redisClient?: RedisClientType;
  private _rabbitMQClient?: RabbitMQClient;
  private _logger?: winston.Logger;
  private _socketServer?: Server;

  private constructor() {}

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  get mongoConnection(): typeof mongoose {
    if (!this._mongoConnection) {
      throw new Error("MongoDB connection not initialized");
    }
    return this._mongoConnection;
  }

  set mongoConnection(conn: typeof mongoose) {
    this._mongoConnection = conn;
  }

  get redisClient(): RedisClientType {
    if (!this._redisClient) {
      throw new Error("Redis client not initialized");
    }
    return this._redisClient;
  }

  set redisClient(client: RedisClientType) {
    this._redisClient = client;
  }

  get rabbitmqClient(): RabbitMQClient {
    if (!this._rabbitMQClient) {
      throw new Error("RabbitMQ Client not initialized");
    }
    return this._rabbitMQClient as RabbitMQClient;
  }

  set rabbitmqClient(client: RabbitMQClient) {
    this._rabbitMQClient = client;
  }

  get socketServer(): Server {
    if (!this._socketServer) {
      throw new Error("Socket Server not initialized");
    }
    return this._socketServer as Server;
  }

  set socketServer(server: Server) {
    this._socketServer = server;
  }

  get logger(): winston.Logger {
    if (!this._logger) {
      throw new Error("RabbitMQ Client not initialized");
    }
    return this._logger as winston.Logger;
  }

  set logger(logger: winston.Logger) {
    this._logger = logger;
  }
}

export const container = DependencyContainer.getInstance();

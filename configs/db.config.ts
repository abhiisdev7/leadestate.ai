import mongoose from "mongoose";
import { createLogger } from "~/configs/logger.config.ts";

const logger = createLogger("db");
import { Env } from "~configs/env.config";

const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  socketTimeoutMS: 30_000,
  serverSelectionTimeoutMS: 10_000,
  retryWrites: true,
};

export async function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    return mongoose;
  }

  const conn = await mongoose.connect(Env.DATABASE_URL!, connectionOptions);

  logger.info("Connected to MongoDB", {
    host: conn.connection.host,
    name: conn.connection.name,
  });

  mongoose.connection.on("error", (err) => {
    logger.error("Mongoose connection error", { err });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("Mongoose disconnected");
  });

  return conn;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.disconnected) {
    return;
  }

  await mongoose.disconnect();
  logger.info("Disconnected from MongoDB");
}

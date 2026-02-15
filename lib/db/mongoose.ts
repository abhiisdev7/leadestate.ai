import mongoose from "mongoose";

const MONGODB_URI =
  process.env.DATABASE_URL ??
  (process.env.DB_USERNAME && process.env.DB_PASSWORD && process.env.DATABASE_NAME
    ? `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.vtp9f.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority&appName=Cluster0`
    : undefined);

if (!MONGODB_URI) {
  throw new Error(
    "DATABASE_URL or (DB_USERNAME, DB_PASSWORD, DATABASE_NAME) must be defined"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached = globalThis.mongooseCache ?? { conn: null, promise: null };

if (process.env.NODE_ENV !== "production") {
  globalThis.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

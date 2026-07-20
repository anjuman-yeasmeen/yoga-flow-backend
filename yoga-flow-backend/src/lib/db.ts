import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGO_DB || "yoga-flow";

export const client = new MongoClient(uri);
export const db: Db = client.db(dbName);

export async function connectDB(): Promise<void> {
  await client.connect();
  console.log(`✅ MongoDB connected (db: ${dbName})`);
}

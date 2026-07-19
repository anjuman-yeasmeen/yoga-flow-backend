import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your MONGODB_URI to the .env file");
}

let client: MongoClient;
let db: Db;

export const connectToDatabase = async (): Promise<Db> => {
  if (db) return db;

  try {
    client = await MongoClient.connect(uri);
    db = client.db("yoga-flow");
    console.log("🍃 [database]: MongoDB Connected Successfully!");
    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
};
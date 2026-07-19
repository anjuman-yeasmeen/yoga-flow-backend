import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// সবার আগে কনফিগ
dotenv.config();

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { connectToDatabase } from './lib/db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Better-Auth Routes
app.use("/api/auth", (req, res) => {
  return toNodeHandler(auth)(req, res);
});

// বেসিক রাউট
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Yoga Flow Backend is Running Perfectly!'
  });
});

// সার্ভার স্টার্ট করার লজিক
const startServer = async () => {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`⚡️ [server]: Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start due to DB error:', error);
    process.exit(1);
  }
};

startServer();
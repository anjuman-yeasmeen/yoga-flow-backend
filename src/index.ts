import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node'; 
import { auth } from './lib/auth'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// BetterAuth Middleware (কোনো ওয়াইল্ডকার্ড এরর ছাড়াই সব /api/auth রিকোয়েস্ট ক্যাচ করবে)
app.use('/api/auth', (req, res, next) => {
  // এটি নিশ্চিত করবে যে /api/auth বা এর পরের যেকোনো সাব-রাউটে রিকোয়েস্ট আসলে BetterAuth হ্যান্ডেল করবে
  return toNodeHandler(auth.handler)(req, res, next);
});

app.get('/', (req, res) => {
  res.send({ message: 'YogaFlow Backend Server is Running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
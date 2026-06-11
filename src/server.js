import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedAdmin } from './utils/seedAdmin.js';

dotenv.config();

const port = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET is required and must be at least 32 characters');
  }

  await connectDB();
  await seedAdmin();

  app.listen(port, () => {
    console.log(`API server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

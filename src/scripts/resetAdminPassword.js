import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

async function resetAdminPassword() {
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD is required and must be at least 8 characters');
  }

  await connectDB();

  const admin = await User.findOne({ username: adminUsername }).select('+password');

  if (!admin) {
    await User.create({
      username: adminUsername,
      password: adminPassword,
      role: 'admin'
    });
    console.log(`Admin account created: ${adminUsername}`);
    return;
  }

  admin.password = adminPassword;
  admin.role = 'admin';
  await admin.save();

  console.log(`Admin password reset for: ${adminUsername}`);
}

resetAdminPassword()
  .catch((error) => {
    console.error('Admin password reset failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

import User from '../models/User.js';

export async function seedAdmin() {
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD is required and must be at least 8 characters');
  }

  const existingAdmin = await User.findOne({ username: adminUsername });

  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
    }

    return;
  }

  await User.create({
    username: adminUsername,
    password: adminPassword,
    role: 'admin'
  });

  console.log(`Default admin created: ${adminUsername}`);
}

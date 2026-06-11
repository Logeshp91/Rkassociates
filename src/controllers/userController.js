import User from '../models/User.js';

export async function createUser(req, res, next) {
  try {
    const username = req.body.username.toLowerCase();
    const { password, role = 'user' } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const user = await User.create({ username, password, role });

    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function getUsers(_req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mainAdminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();

    if (user.username === mainAdminUsername) {
      return res.status(403).json({ message: 'The main admin account cannot be deleted' });
    }

    await user.deleteOne();

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

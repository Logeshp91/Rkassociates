import User from '../models/User.js';
import { createToken } from '../utils/createToken.js';

export async function login(req, res, next) {
  try {
    const username = req.body.username.toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    return res.json({
      token: createToken(user),
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMe(req, res) {
  return res.json({
    user: {
      _id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
}

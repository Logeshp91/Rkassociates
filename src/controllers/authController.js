import crypto from 'crypto';
import User from '../models/User.js';
import { createToken } from '../utils/createToken.js';
import { sendEmail } from '../utils/sendEmail.js';

function publicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function login(req, res, next) {
  try {
    const username = req.body.username.toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.error('Invalid username or password', 401);
    }

    return res.success('Login successful', {
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMe(req, res) {
  return res.success('Authenticated user retrieved successfully', {
    user: publicUser(req.user)
  });
}

export async function forgotPassword(req, res, next) {
  try {
    const username = req.body.username.toLowerCase();
    const user = await User.findOne({ username }).select('+passwordResetToken +passwordResetExpires');

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      await sendEmail({
        to: user.email,
        subject: 'Password reset request',
        text: `Use this token to reset your password: ${resetToken}`
      });
    }

    return res.success('If the account exists, password reset instructions have been sent');
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const resetToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.error('Invalid or expired password reset token', 400);
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.success('Password reset successful');
  } catch (error) {
    return next(error);
  }
}

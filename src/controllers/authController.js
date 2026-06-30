import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { createToken } from '../utils/createToken.js';
import { sendEmail } from '../utils/sendEmail.js';

const OTP_EXPIRY_MINUTES = 10;

function readEnvValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function publicUser(user) {
  return {
    _id: user._id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt
  };
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function getAdminEmail() {
  return (
    readEnvValue(process.env.ADMIN_EMAIL) ||
    readEnvValue(process.env.SMTP_USER)
  );
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
    const user = await User.findOne({ username }).select('+passwordResetOtp +passwordResetOtpExpires');

    if (!user) {
      return res.error('User not found', 404);
    }

    const adminEmail = getAdminEmail();

    if (!adminEmail) {
      return res.error('Admin email is not configured', 500);
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    user.passwordResetOtp = hashOtp(otp);
    user.passwordResetOtpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        to: adminEmail,
        subject: 'Password reset OTP',
        text: [
          'A password reset OTP was requested.',
          '',
          `Username: ${user.username}`,
          `OTP: ${otp}`,
          '',
          `This OTP expires in ${OTP_EXPIRY_MINUTES} minutes and can be used only once.`
        ].join('\n')
      });
    } catch (error) {
      console.error('forgotPassword failed:', error);
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });

      if (error.message === 'SMTP is not configured') {
        return res.error('Email service is not configured', 500);
      }

      console.error('forgotPassword failed:', error);

return res.error('Failed to send password reset email', 500);
    }

    return res.success('OTP sent to the configured admin email');
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const username = req.body.username.toLowerCase();
    const user = await User.findOne({ username }).select('+passwordResetOtp +passwordResetOtpExpires');

    if (!user) {
      return res.error('User not found', 404);
    }

    if (!user.passwordResetOtp || !user.passwordResetOtpExpires) {
      return res.error('No active password reset OTP found', 400);
    }

    if (user.passwordResetOtpExpires <= new Date()) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.error('Password reset OTP has expired', 400);
    }

    const otpHash = hashOtp(req.body.otp);

    if (user.passwordResetOtp !== otpHash) {
      return res.error('Invalid password reset OTP', 400);
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const updateResult = await User.updateOne(
      {
        _id: user._id,
        passwordResetOtp: otpHash,
        passwordResetOtpExpires: { $gt: new Date() }
      },
      {
        $set: { password: hashedPassword },
        $unset: { passwordResetOtp: '', passwordResetOtpExpires: '' }
      }
    );

    if (updateResult.modifiedCount !== 1) {
      return res.error('Invalid or expired password reset OTP', 400);
    }

    return res.success('Password reset successful');
  } catch (error) {
    return next(error);
  }
}

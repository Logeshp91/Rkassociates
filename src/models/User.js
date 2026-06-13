import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    passwordResetOtp: {
      type: String,
      select: false
    },
    passwordResetOtpExpires: {
      type: Date,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordResetOtp;
    delete ret.passwordResetOtpExpires;
    return ret;
  }
});

export default mongoose.model('User', userSchema);

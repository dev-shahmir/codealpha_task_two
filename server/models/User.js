import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 280 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    timezone: { type: String, default: 'UTC' },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: {
        taskAssignments: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        dueDateReminders: { type: Boolean, default: true },
        projectActivity: { type: Boolean, default: true },
      },
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// email & username indexes are auto-created via unique: true
userSchema.index({ name: 'text', username: 'text', email: 'text' });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    role: this.role,
    timezone: this.timezone,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);

import User from '../models/User.js';
import { ok, fail } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken, generateResetToken, hashToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/emailService.js';
import { config } from '../config/index.js';

function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? 'email' : 'username';
    return fail(res, `That ${field} is already in use`, 'DUPLICATE_' + field.toUpperCase(), 409);
  }

  const user = await User.create({ name, username, email, password });
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  return ok(res, { user: user.toPublicJSON(), token }, 'Welcome to VYBEBOARD', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return fail(res, 'Incorrect email or password', 'INVALID_CREDENTIALS', 401);
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  return ok(res, { user: user.toPublicJSON(), token }, 'Welcome back');
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  return ok(res, null, 'Logged out');
});

export const getMe = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user.toPublicJSON() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = req.body;

  if (updates.username) {
    const taken = await User.findOne({ username: updates.username, _id: { $ne: req.user._id } });
    if (taken) return fail(res, 'That username is already taken', 'DUPLICATE_USERNAME', 409);
  }

  Object.assign(req.user, updates);
  await req.user.save();

  return ok(res, { user: req.user.toPublicJSON() }, 'Profile updated');
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return fail(res, 'Current password is incorrect', 'INVALID_PASSWORD', 401);
  }

  user.password = newPassword;
  await user.save();

  return ok(res, null, 'Password updated');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way to avoid leaking which emails are registered
  if (!user) {
    return ok(res, null, 'If that email exists, a reset link has been sent');
  }

  const { rawToken, hashedToken } = generateResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + config.resetTokenExpiresMinutes * 60 * 1000;
  await user.save();

  await sendEmail({
    to: email,
    subject: 'Reset your VYBEBOARD password',
    text: `You requested a password reset for your VYBEBOARD account. Use the following link to reset your password: ${config.clientUrl}/reset-password?token=${rawToken}`,
  });

  return ok(res, config.env !== 'production' ? { devResetToken: rawToken } : null, 'If that email exists, a reset link has been sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) return fail(res, 'This reset link is invalid or has expired', 'INVALID_RESET_TOKEN', 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return ok(res, null, 'Password reset. You can now log in.');
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Clean up user's own projects and remove user from other projects
  await User.findByIdAndDelete(userId);
  res.clearCookie('token');

  return ok(res, null, 'Your account has been deleted');
});


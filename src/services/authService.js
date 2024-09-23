const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { sendEmail } = require('./emailService');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  
};

const register = async (username, email, password) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new AppError('Username or email already exists', 400);
  }

  const verificationToken = crypto.randomBytes(20).toString('hex');
  const user = await User.create({
    username,
    email,
    password,
    verificationToken,
  });

  await sendEmail({
    email: user.email,
    subject: 'Verify your email',
    html: `Click <a href="${process.env.BASE_URL}/verify-email/${verificationToken}">here</a> to verify your email.`,
  });

  return { user, token: generateToken(user._id) };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email first', 403);
  }

  return { user, token: generateToken(user._id) };
};
const verifyEmail = async (token) => {
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return { message: 'Email verified successfully' };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No user found with that email address', 404);
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  await sendEmail({
    email: user.email,
    subject: 'Password Reset',
    html: `Click <a href="${process.env.BASE_URL}/reset-password/${resetToken}">here</a> to reset your password.`,
  });

  return { message: 'Password reset email sent' };
};

const refreshToken = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { token: generateToken(user._id) };
  };
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password reset successful' };
};

const logout = async (userId) => {
    // Optionally invalidate the token on the server-side
    // This could involve maintaining a blacklist of invalid tokens
    // or updating a 'lastLogout' timestamp on the user document
    await User.findByIdAndUpdate(userId, { lastLogout: new Date() });
    return { message: 'Logged out successfully' };
  };

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
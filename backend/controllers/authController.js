const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Helper to generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'hrms_super_secret_jwt_key_2026_antigravity',
    { expiresIn: '7d' }
  );
};

// @desc Registration disabled for public users (HR Only)
// @route POST /api/auth/register
exports.register = async (req, res) => {
  return res.status(403).json({
    error: 'Self-registration is disabled. Employee accounts can only be created by an HR Admin.'
  });
};

// @desc Login user with email and password
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};

// @desc Google Login (Only pre-created accounts by HR can sign in)
// @route POST /api/auth/google
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google email is required' });
    }

    // Check if employee account exists in system (provisioned by HR)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(403).json({
        error: 'Account not found. Employee accounts can only be created by an HR Admin.'
      });
    }

    if (googleId && !user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Google Sign-In successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Google authentication failed: ' + error.message });
  }
};

// @desc Request Password Reset (Employee notifies HR for reset link)
// @route POST /api/auth/request-reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide your registered employee email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({
        message: 'Password reset request submitted. If your account exists, your HR Admin has been notified to issue your reset link.'
      });
    }

    user.resetRequested = true;
    user.resetRequestedAt = Date.now();
    await user.save();

    res.json({
      message: 'Password reset request submitted. Only your HR Admin has the authority to issue your reset password link.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request password reset: ' + error.message });
  }
};

// @desc Change Password (For logged in employee)
// @route POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const targetId = req.user?.id || userId;
    const user = await User.findById(targetId);

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password: ' + error.message });
  }
};

// @desc Reset Password using HR-issued token
// @route POST /api/auth/reset-password
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset link. Please contact your HR Admin.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.resetRequested = false;
    user.resetRequestedAt = null;
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed: ' + error.message });
  }
};


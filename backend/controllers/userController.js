const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc Get current authenticated user profile
// @route GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile: ' + err.message });
  }
};

// @desc Create initial HR Admin (Only works if NO users exist in the database)
// @route POST /api/users/setup
exports.setupAdmin = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({ error: 'System is already initialized. Cannot run setup.' });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'hr',
      department: 'Human Resources'
    });

    res.status(201).json({
      message: 'Initial HR Admin created successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Setup failed: ' + error.message });
  }
};

// @desc Get all users or filtered by role/department
// @route GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const demoEmails = [
      'hr@company.com',
      'mentor@company.com',
      'mentee@company.com',
      'david.mentor@company.com',
      'emma.mentee@company.com'
    ];
    const query = process.env.SHOW_DEMO_DATA === 'true'
      ? {}
      : { isDemo: { $ne: true }, email: { $nin: demoEmails } };

    if (role) query.role = role;
    if (department) query.department = department;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
};

// @desc Create a user (HR only)
// @route POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const resolvedRole = role || 'mentee';
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: resolvedRole,
      department: department || 'Engineering',
      mustChangePassword: resolvedRole !== 'hr'
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
};

// @desc Update user (HR only)
// @route PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (department) user.department = department;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
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
    res.status(500).json({ error: 'Failed to update user: ' + error.message });
  }
};

// @desc Generate Password Reset Token for Employee (HR Only Authority)
// @route POST /api/users/:id/reset-token
exports.generateResetToken = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
    user.resetRequested = false;
    user.resetRequestedAt = null;

    await user.save();

    res.json({
      message: 'Password reset link generated by HR Admin.',
      resetToken,
      employeeName: user.name,
      employeeEmail: user.email
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate reset token: ' + error.message });
  }
};

// @desc Delete user (HR only)
// @route DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', userId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user: ' + error.message });
  }
};


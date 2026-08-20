const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['hr', 'mentor', 'mentee'],
    default: 'mentee',
    required: true
  },
  department: {
    type: String,
    default: 'Engineering',
    trim: true
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  resetRequested: {
    type: Boolean,
    default: false
  },
  resetRequestedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('User', UserSchema);

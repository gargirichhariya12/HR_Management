const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['mentor', 'mentee'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  feedback: {
    type: String,
    default: ''
  },
  period: {
    type: String,
    default: 'Q3 2026'
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'locked'],
    default: 'pending'
  },
  deadline: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);

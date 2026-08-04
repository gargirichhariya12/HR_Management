const mongoose = require('mongoose');

const MentorMenteeSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorMentee', MentorMenteeSchema);

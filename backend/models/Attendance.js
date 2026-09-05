const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    clockIn: {
      type: Date,
      required: true
    },
    clockOut: {
      type: Date,
      default: null
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['clocked-in', 'clocked-out'],
      default: 'clocked-in'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user's active/daily records quickly
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

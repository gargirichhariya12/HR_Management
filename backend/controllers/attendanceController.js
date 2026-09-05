const Attendance = require('../models/Attendance');
const User = require('../models/User');
const MentorMentee = require('../models/MentorMentee');

// Helper to format Date to YYYY-MM-DD
const getTodayDateString = (dateObj = new Date()) => {
  return dateObj.toISOString().split('T')[0];
};

// @desc    Clock In
// @route   POST /api/attendance/clock-in
// @access  Private
const clockIn = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has an active clock-in session
    const activeSession = await Attendance.findOne({ userId, status: 'clocked-in' });
    if (activeSession) {
      return res.status(400).json({ error: 'You are already clocked in.' });
    }

    const now = new Date();
    const todayDate = getTodayDateString(now);

    const attendance = await Attendance.create({
      userId,
      date: todayDate,
      clockIn: now,
      status: 'clocked-in',
      notes: req.body.notes || ''
    });

    await attendance.populate('userId', 'name email role department');

    res.status(201).json({
      message: 'Successfully clocked in!',
      attendance
    });
  } catch (error) {
    res.status(500).json({ error: 'Clock-in failed: ' + error.message });
  }
};

// @desc    Clock Out
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find active session
    const activeSession = await Attendance.findOne({ userId, status: 'clocked-in' });
    if (!activeSession) {
      return res.status(400).json({ error: 'No active clock-in session found.' });
    }

    const clockOutTime = new Date();
    const durationMs = clockOutTime - new Date(activeSession.clockIn);
    const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));

    activeSession.clockOut = clockOutTime;
    activeSession.durationMinutes = durationMinutes;
    activeSession.status = 'clocked-out';
    if (req.body.notes) {
      activeSession.notes = req.body.notes;
    }

    await activeSession.save();
    await activeSession.populate('userId', 'name email role department');

    res.json({
      message: 'Successfully clocked out!',
      attendance: activeSession
    });
  } catch (error) {
    res.status(500).json({ error: 'Clock-out failed: ' + error.message });
  }
};

// @desc    Get Current User's Today Status
// @route   GET /api/attendance/status
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayDate = getTodayDateString();

    const activeSession = await Attendance.findOne({ userId, status: 'clocked-in' });
    const todayRecords = await Attendance.find({ userId, date: todayDate }).sort({ clockIn: -1 });

    let todayTotalMinutes = 0;
    const now = new Date();

    todayRecords.forEach((record) => {
      if (record.status === 'clocked-out') {
        todayTotalMinutes += record.durationMinutes || 0;
      } else if (record.status === 'clocked-in') {
        const liveMinutes = Math.max(0, Math.round((now - new Date(record.clockIn)) / (1000 * 60)));
        todayTotalMinutes += liveMinutes;
      }
    });

    res.json({
      isClockedIn: !!activeSession,
      activeSession,
      todayTotalMinutes,
      todayRecords
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve attendance status: ' + error.message });
  }
};

// @desc    Get Current User's Attendance History
// @route   GET /api/attendance/my-history
// @access  Private
const getMyHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await Attendance.find({ userId }).sort({ clockIn: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve attendance history: ' + error.message });
  }
};

// @desc    Get All Workforce Live Attendance (HR & Mentors)
// @route   GET /api/attendance/all
// @access  Private (HR & Mentor)
const getAllAttendance = async (req, res) => {
  try {
    let allowedUserIds = [];

    if (req.user.role === 'hr') {
      const users = await User.find({}).select('_id name email role department');
      allowedUserIds = users.map((u) => u._id);
    } else if (req.user.role === 'mentor') {
      // Mentors see their mentees + themselves
      const pairings = await MentorMentee.find({ mentorId: req.user._id }).select('menteeId');
      allowedUserIds = [req.user._id, ...pairings.map((p) => p.menteeId)];
    } else {
      // Mentees see only themselves
      allowedUserIds = [req.user._id];
    }

    const todayDate = getTodayDateString();
    const users = await User.find({ _id: { $in: allowedUserIds } }).select('name email role department');

    const todayRecords = await Attendance.find({
      userId: { $in: allowedUserIds },
      date: todayDate
    }).sort({ clockIn: -1 });

    const activeSessions = await Attendance.find({
      userId: { $in: allowedUserIds },
      status: 'clocked-in'
    });

    const activeUserMap = {};
    activeSessions.forEach((s) => {
      activeUserMap[s.userId.toString()] = s;
    });

    const now = new Date();

    const workforceStatus = users.map((u) => {
      const activeSess = activeUserMap[u._id.toString()];
      const userTodayRecords = todayRecords.filter((r) => r.userId.toString() === u._id.toString());

      let totalMins = 0;
      userTodayRecords.forEach((r) => {
        if (r.status === 'clocked-out') {
          totalMins += r.durationMinutes || 0;
        } else if (r.status === 'clocked-in') {
          totalMins += Math.max(0, Math.round((now - new Date(r.clockIn)) / (1000 * 60)));
        }
      });

      return {
        user: {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department
        },
        isClockedIn: !!activeSess,
        activeSession: activeSess || null,
        todayTotalMinutes: totalMins,
        lastRecord: userTodayRecords[0] || null
      };
    });

    // Recent logs across the team
    const recentLogs = await Attendance.find({ userId: { $in: allowedUserIds } })
      .populate('userId', 'name email role department')
      .sort({ clockIn: -1 })
      .limit(30);

    res.json({
      workforceStatus,
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve workforce attendance: ' + error.message });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyHistory,
  getAllAttendance
};

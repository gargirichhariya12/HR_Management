const MentorMentee = require('../models/MentorMentee');
const User = require('../models/User');

// @desc Create Mentor-Mentee mapping (HR only)
// @route POST /api/mentor-mentee
exports.assignMentorMentee = async (req, res) => {
  try {
    const { mentorId, menteeId } = req.body;

    if (!mentorId || !menteeId) {
      return res.status(400).json({ error: 'mentorId and menteeId are required' });
    }

    if (mentorId === menteeId) {
      return res.status(400).json({ error: 'Mentor and mentee cannot be the same user' });
    }

    const mentor = await User.findById(mentorId);
    const mentee = await User.findById(menteeId);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ error: 'Invalid mentor user or user is not a mentor' });
    }

    if (!mentee || mentee.role !== 'mentee') {
      return res.status(400).json({ error: 'Invalid mentee user or user is not a mentee' });
    }

    // Check if active mapping already exists
    const existing = await MentorMentee.findOne({ mentorId, menteeId, status: 'active' });
    if (existing) {
      return res.status(400).json({ error: 'An active assignment already exists for this pair' });
    }

    const mapping = await MentorMentee.create({ mentorId, menteeId });
    const populatedMapping = await MentorMentee.findById(mapping._id)
      .populate('mentorId', 'name email department role')
      .populate('menteeId', 'name email department role');

    res.status(201).json({
      message: 'Mentor-Mentee assigned successfully',
      mapping: populatedMapping
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign mentor-mentee: ' + error.message });
  }
};

// @desc Get Mentor-Mentee assignments (Role-aware filtering)
// @route GET /api/mentor-mentee
exports.getAssignments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'mentor') {
      query.mentorId = req.user._id;
    } else if (req.user.role === 'mentee') {
      query.menteeId = req.user._id;
    }
    // HR gets all assignments

    const assignments = await MentorMentee.find(query)
      .populate('mentorId', 'name email department role')
      .populate('menteeId', 'name email department role')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments: ' + error.message });
  }
};

// @desc Delete/End Mentor-Mentee mapping (HR only)
// @route DELETE /api/mentor-mentee/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await MentorMentee.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment: ' + error.message });
  }
};

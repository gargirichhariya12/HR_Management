const User = require('../models/User');
const MentorMentee = require('../models/MentorMentee');
const Review = require('../models/Review');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    if (process.env.SEED_DEMO_DATA !== 'true') {
      console.log('[Seed] Demo data disabled. Skipping initial seed.');
      return;
    }

    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log('[Seed] Database already contains users. Skipping initial seed.');
      return;
    }

    console.log('[Seed] Seeding initial HR, Mentor, and Mentee accounts...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create Users
    const hr = await User.create({
      name: 'Sarah Connor (HR Lead)',
      email: 'hr@company.com',
      password: passwordHash,
      role: 'hr',
      department: 'Human Resources',
      isDemo: true
    });

    const mentor1 = await User.create({
      name: 'Alex Rivera (Senior Tech Lead)',
      email: 'mentor@company.com',
      password: passwordHash,
      role: 'mentor',
      department: 'Engineering',
      isDemo: true
    });

    const mentee1 = await User.create({
      name: 'Jordan Lee (Junior Frontend Dev)',
      email: 'mentee@company.com',
      password: passwordHash,
      role: 'mentee',
      department: 'Engineering',
      isDemo: true
    });

    const mentor2 = await User.create({
      name: 'David Chen (Product Lead)',
      email: 'david.mentor@company.com',
      password: passwordHash,
      role: 'mentor',
      department: 'Product',
      isDemo: true
    });

    const mentee2 = await User.create({
      name: 'Emma Watson (UI/UX Designer)',
      email: 'emma.mentee@company.com',
      password: passwordHash,
      role: 'mentee',
      department: 'Design',
      isDemo: true
    });

    // Create Mentor-Mentee assignments
    const assignment1 = await MentorMentee.create({
      mentorId: mentor1._id,
      menteeId: mentee1._id,
      startDate: new Date('2026-01-15')
    });

    await MentorMentee.create({
      mentorId: mentor2._id,
      menteeId: mentee2._id,
      startDate: new Date('2026-02-01')
    });

    // Create sample reviews
    await Review.create({
      reviewerId: mentor1._id,
      revieweeId: mentee1._id,
      role: 'mentee',
      rating: 5,
      feedback: 'Jordan has demonstrated extraordinary growth in React and system design. High initiative and speed.',
      period: 'Q2 2026',
      status: 'submitted'
    });

    // Overdue pending review for cron demonstration
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 3); // 3 days ago

    await Review.create({
      reviewerId: mentor1._id,
      revieweeId: mentee1._id,
      role: 'mentee',
      rating: 4,
      feedback: '',
      period: 'Q3 2026',
      status: 'pending',
      deadline: overdueDate
    });

    await Review.create({
      reviewerId: mentee1._id,
      revieweeId: mentor1._id,
      role: 'mentor',
      rating: 5,
      feedback: 'Alex is a fantastic mentor. Always available for code reviews and architectural advice.',
      period: 'Q2 2026',
      status: 'submitted'
    });

    // Seed Sample Attendance Records
    const todayStr = new Date().toISOString().split('T')[0];

    // Active session for Jordan Lee (Mentee 1)
    const activeClockIn = new Date();
    activeClockIn.setHours(activeClockIn.getHours() - 2, activeClockIn.getMinutes() - 15); // Clocked in 2h 15m ago

    await Attendance.create({
      userId: mentee1._id,
      date: todayStr,
      clockIn: activeClockIn,
      status: 'clocked-in',
      notes: 'Morning dev sprint & code review'
    });

    // Active session for Alex Rivera (Mentor 1)
    const mentorClockIn = new Date();
    mentorClockIn.setHours(mentorClockIn.getHours() - 3, mentorClockIn.getMinutes() - 40);

    await Attendance.create({
      userId: mentor1._id,
      date: todayStr,
      clockIn: mentorClockIn,
      status: 'clocked-in',
      notes: 'Architecture & Mentorship sessions'
    });

    // Yesterday completed session for Emma Watson
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yestIn = new Date(yesterday);
    yestIn.setHours(9, 0, 0);
    const yestOut = new Date(yesterday);
    yestOut.setHours(17, 30, 0);

    await Attendance.create({
      userId: mentee2._id,
      date: yesterdayStr,
      clockIn: yestIn,
      clockOut: yestOut,
      durationMinutes: 510, // 8.5 hours
      status: 'clocked-out',
      notes: 'Figma design system updates'
    });

    console.log('[Seed] Database successfully seeded with HR, Mentors, Mentees, mappings, reviews, and attendance!');
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error.message);
  }
};

module.exports = seedData;


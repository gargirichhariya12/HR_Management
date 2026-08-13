const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config(); // Must be before passport is required

const passport = require('./config/passport');
const connectDB = require('./config/db');
const seedData = require('./utils/seed');
const { initCronJobs, checkOverdueReviews } = require('./automation/cronJobs');

const app = express();

// CORS — allow frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Session middleware (required for Passport OAuth flow only)
app.use(session({
  secret: process.env.SESSION_SECRET || 'hrms_session_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 5 * 60 * 1000 } // 5 min — only needed during OAuth handshake
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/mentor-mentee', require('./routes/mentorMenteeRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Manual Cron Trigger Endpoint (For Demo & Verification)
app.post('/api/cron/trigger', async (req, res) => {
  const result = await checkOverdueReviews();
  res.json({
    message: 'Manual cron review deadline check executed',
    result
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HRMS Backend', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();
  await seedData();
  initCronJobs();

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 HRMS Backend running on http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
};

startServer();

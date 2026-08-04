const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedData = require('./utils/seed');
const { initCronJobs, checkOverdueReviews } = require('./automation/cronJobs');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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

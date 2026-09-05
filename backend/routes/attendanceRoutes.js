const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyHistory,
  getAllAttendance
} = require('../controllers/attendanceController');

// All attendance routes require user to be authenticated
router.use(auth);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/status', getTodayStatus);
router.get('/my-history', getMyHistory);
router.get('/all', getAllAttendance);

module.exports = router;

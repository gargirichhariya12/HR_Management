const express = require('express');
const router = express.Router();
const { assignMentorMentee, getAssignments, deleteAssignment } = require('../controllers/mentorMenteeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('hr'), assignMentorMentee);
router.get('/', auth, getAssignments);
router.delete('/:id', auth, roleCheck('hr'), deleteAssignment);

module.exports = router;

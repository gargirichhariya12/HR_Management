const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, generateResetToken } = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, getUsers);
router.post('/', auth, roleCheck('hr'), createUser);
router.put('/:id', auth, roleCheck('hr'), updateUser);
router.post('/:id/reset-token', auth, roleCheck('hr'), generateResetToken);
router.delete('/:id', auth, roleCheck('hr'), deleteUser);

module.exports = router;


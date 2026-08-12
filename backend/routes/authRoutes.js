const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  requestPasswordReset,
  changePassword,
  resetPasswordWithToken
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/request-reset', requestPasswordReset);
router.post('/change-password', changePassword);
router.post('/reset-password', resetPasswordWithToken);

module.exports = router;


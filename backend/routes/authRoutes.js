const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const {
  register,
  login,
  requestPasswordReset,
  changePassword,
  resetPasswordWithToken
} = require('../controllers/authController');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Helper to generate JWT
const generateToken = (userId, role) =>
  jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'hrms_super_secret_jwt_key_2026_antigravity',
    { expiresIn: '7d' }
  );

// ─── Standard email/password auth ────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);

// ─── Passport Google OAuth 2.0 ───────────────────────────────────────────────

// Step 1 — Kick off the Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'       // Always show account picker
  })
);

// Step 2 — Google redirects back here after user consents
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,                // We use JWT, not sessions
    failureRedirect: `${FRONTEND_URL}/?error=unregistered_id`
  }),
  (req, res) => {
    try {
      // req.user is the HR-provisioned employee found by Passport strategy
      const token = generateToken(req.user._id, req.user.role);

      // Redirect to frontend with JWT in URL — frontend reads it, stores it
      res.redirect(`${FRONTEND_URL}/?token=${token}`);
    } catch (err) {
      res.redirect(`${FRONTEND_URL}/?error=token_generation_failed`);
    }
  }
);

// ─── Password reset routes ────────────────────────────────────────────────────
router.post('/request-reset', requestPasswordReset);
router.post('/change-password', changePassword);
router.post('/reset-password', resetPasswordWithToken);

module.exports = router;

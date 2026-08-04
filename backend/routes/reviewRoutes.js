const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, updateReview } = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/', auth, createReview);
router.get('/:userId', auth, getUserReviews);
router.put('/:id', auth, updateReview);

module.exports = router;

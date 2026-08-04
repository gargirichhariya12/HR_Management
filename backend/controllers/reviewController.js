const Review = require('../models/Review');
const User = require('../models/User');
const MentorMentee = require('../models/MentorMentee');

// @desc Create a review request / submission
// @route POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { reviewerId, revieweeId, role, rating, feedback, period, deadline } = req.body;

    // Use current user as reviewer if not specified
    const actualReviewerId = reviewerId || req.user._id;

    if (!revieweeId || !role) {
      return res.status(400).json({ error: 'revieweeId and role (mentor/mentee) are required' });
    }

    // Check relationship if non-HR user
    if (req.user.role !== 'hr') {
      let isAssigned = false;
      if (role === 'mentor') {
        // Mentee reviewing Mentor
        const match = await MentorMentee.findOne({ mentorId: revieweeId, menteeId: actualReviewerId, status: 'active' });
        if (match) isAssigned = true;
      } else if (role === 'mentee') {
        // Mentor reviewing Mentee
        const match = await MentorMentee.findOne({ mentorId: actualReviewerId, menteeId: revieweeId, status: 'active' });
        if (match) isAssigned = true;
      }

      if (!isAssigned) {
        return res.status(403).json({ error: 'You are not assigned to review this user' });
      }
    }

    const review = await Review.create({
      reviewerId: actualReviewerId,
      revieweeId,
      role,
      rating: rating || 5,
      feedback: feedback || '',
      period: period || 'Q3 2026',
      status: feedback ? 'submitted' : 'pending',
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const populated = await Review.findById(review._id)
      .populate('reviewerId', 'name email role department')
      .populate('revieweeId', 'name email role department');

    res.status(201).json({
      message: 'Review created successfully',
      review: populated
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review: ' + error.message });
  }
};

// @desc Get reviews for a specific user or logged-in user
// @route GET /api/reviews/:userId
exports.getUserReviews = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    // HR can view all reviews if userId is 'all'
    if (req.user.role === 'hr' && targetUserId === 'all') {
      const allReviews = await Review.find()
        .populate('reviewerId', 'name email role department')
        .populate('revieweeId', 'name email role department')
        .sort({ createdAt: -1 });
      return res.json(allReviews);
    }

    // Role security check: HR can view any user's reviews; Mentor/Mentee can view reviews where they are reviewer or reviewee
    if (req.user.role !== 'hr' && req.user._id.toString() !== targetUserId) {
      return res.status(403).json({ error: 'Unauthorized to view reviews for this user' });
    }

    const reviews = await Review.find({
      $or: [{ reviewerId: targetUserId }, { revieweeId: targetUserId }]
    })
      .populate('reviewerId', 'name email role department')
      .populate('revieweeId', 'name email role department')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews: ' + error.message });
  }
};

// @desc Update/Submit a review
// @route PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const { rating, feedback, status } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Security check: Only the reviewer or HR can update/submit the review
    if (req.user.role !== 'hr' && review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the assigned reviewer or HR can update this review' });
    }

    if (review.status === 'locked' && req.user.role !== 'hr') {
      return res.status(400).json({ error: 'This review is locked and cannot be edited' });
    }

    if (rating) review.rating = rating;
    if (feedback !== undefined) review.feedback = feedback;
    if (status) review.status = status;
    else review.status = 'submitted';

    await review.save();

    const populated = await Review.findById(review._id)
      .populate('reviewerId', 'name email role department')
      .populate('revieweeId', 'name email role department');

    res.json({
      message: 'Review updated successfully',
      review: populated
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review: ' + error.message });
  }
};

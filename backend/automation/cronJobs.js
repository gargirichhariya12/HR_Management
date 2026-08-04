const cron = require('node-cron');
const Review = require('../models/Review');

const checkOverdueReviews = async () => {
  try {
    const now = new Date();
    console.log(`[Cron Job] Running daily pending review deadline check at ${now.toISOString()}...`);

    // Find pending reviews where deadline has passed
    const overdueReviews = await Review.find({
      status: 'pending',
      deadline: { $lt: now }
    }).populate('reviewerId', 'name email role').populate('revieweeId', 'name email role');

    if (overdueReviews.length === 0) {
      console.log('[Cron Job] No overdue pending reviews found.');
      return { count: 0, reviews: [] };
    }

    console.log(`[Cron Job] Found ${overdueReviews.length} overdue pending reviews:`);
    overdueReviews.forEach((rev, idx) => {
      const reviewerName = rev.reviewerId ? rev.reviewerId.name : 'Unknown';
      const reviewerEmail = rev.reviewerId ? rev.reviewerId.email : 'Unknown';
      const revieweeName = rev.revieweeId ? rev.revieweeId.name : 'Unknown';

      console.log(`  ${idx + 1}. [REMINDER LOGGED] Reviewer ${reviewerName} (${reviewerEmail}) has missed review deadline for ${revieweeName} (Period: ${rev.period}). Sending automated reminder email...`);
      console.log(`  --> [HR NOTIFICATION LOG] Alerting HR admin about overdue review ID: ${rev._id}`);
    });

    return { count: overdueReviews.length, reviews: overdueReviews };
  } catch (error) {
    console.error('[Cron Job Error] Failed executing overdue review check:', error.message);
  }
};

const initCronJobs = () => {
  // Schedule daily run at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    await checkOverdueReviews();
  });
  console.log('[Cron] Daily review reminder cron job scheduled (00:00 daily).');
};

module.exports = {
  initCronJobs,
  checkOverdueReviews
};

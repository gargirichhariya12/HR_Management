import React, { useState, useEffect } from 'react';
import { Star, Send, X, FileText, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ existingReview, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [reviewees, setReviewees] = useState([]);
  const [targetUser, setTargetUser] = useState('');
  const [reviewRole, setReviewRole] = useState(user?.role === 'mentor' ? 'mentee' : 'mentor');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [period, setPeriod] = useState('Q3 2026');

  const [loading, setLoading] = useState(false);
  const [fetchingTargets, setFetchingTargets] = useState(true);
  const [error, setError] = useState('');

  const isEditMode = !!existingReview;

  useEffect(() => {
    if (existingReview) {
      setTargetUser(existingReview.revieweeId?._id || existingReview.revieweeId);
      setReviewRole(existingReview.role);
      setRating(existingReview.rating || 5);
      setFeedback(existingReview.feedback || '');
      setPeriod(existingReview.period || 'Q3 2026');
      setFetchingTargets(false);
    } else {
      // Fetch available reviewees based on assignments
      const fetchTargets = async () => {
        try {
          if (user?.role === 'hr') {
            const allUsersRes = await api.get('/users');
            setReviewees(allUsersRes.data.filter((u) => u._id !== user.id));
          } else {
            const assignmentsRes = await api.get('/mentor-mentee');
            if (user?.role === 'mentor') {
              // Mentees assigned to mentor
              const list = assignmentsRes.data.map((a) => a.menteeId).filter(Boolean);
              setReviewees(list);
              if (list.length > 0) setTargetUser(list[0]._id);
            } else if (user?.role === 'mentee') {
              // Mentor assigned to mentee
              const list = assignmentsRes.data.map((a) => a.mentorId).filter(Boolean);
              setReviewees(list);
              if (list.length > 0) setTargetUser(list[0]._id);
            }
          }
        } catch (err) {
          setError('Failed to fetch assigned candidates for review.');
        } finally {
          setFetchingTargets(false);
        }
      };
      fetchTargets();
    }
  }, [existingReview, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!targetUser && !isEditMode) {
      setError('Please select an employee to review.');
      return;
    }

    if (!feedback.trim()) {
      setError('Please provide written feedback for the review.');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/reviews/${existingReview._id}`, {
          rating,
          feedback,
          status: 'submitted'
        });
      } else {
        await api.post('/reviews', {
          reviewerId: user.id,
          revieweeId: targetUser,
          role: reviewRole,
          rating,
          feedback,
          period,
          status: 'submitted'
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-olive-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="w-full max-w-xl bg-white border border-olive-200 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-olive-100">
          <h2 className="text-lg font-bold text-olive-950 flex items-center gap-2">
            <FileText size={20} className="text-olive-700" /> {isEditMode ? 'Complete Review' : 'Submit Performance Review'}
          </h2>
          <button className="p-1 text-olive-400 hover:text-olive-900 rounded-lg transition-colors" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {fetchingTargets ? (
          <div className="text-center py-8 text-olive-700 font-semibold text-sm">Loading review details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditMode && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-olive-900">Employee to Review</label>
                {reviewees.length === 0 ? (
                  <p className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium">
                    No active mentor/mentee pairings found. An HR Admin must pair you with a mentor/mentee first.
                  </p>
                ) : (
                  <select
                    className="w-full px-3.5 py-2 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    required
                  >
                    <option value="">-- Select Employee --</option>
                    {reviewees.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.role.toUpperCase()} - {r.department})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {isEditMode && existingReview.revieweeId && (
              <div className="p-3 bg-olive-50 border border-olive-200 rounded-xl text-xs text-olive-800 font-medium">
                <span>Reviewing: </span>
                <strong className="text-olive-950 font-bold">{existingReview.revieweeId.name}</strong> ({existingReview.period})
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-olive-900">Review Period</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all disabled:bg-olive-50"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  disabled={isEditMode}
                >
                  <option value="Q1 2026">Q1 2026</option>
                  <option value="Q2 2026">Q2 2026</option>
                  <option value="Q3 2026">Q3 2026</option>
                  <option value="Q4 2026">Q4 2026</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-olive-900">Review Perspective</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all disabled:bg-olive-50"
                  value={reviewRole}
                  onChange={(e) => setReviewRole(e.target.value)}
                  disabled={isEditMode || user.role !== 'hr'}
                >
                  <option value="mentee">Reviewing Mentee Performance</option>
                  <option value="mentor">Reviewing Mentor Guidance</option>
                </select>
              </div>
            </div>

            {/* Interactive Star Rating */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900">Performance Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 hover:scale-110 transition-transform"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      size={26}
                      className={
                        star <= (hoverRating || rating)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }
                    />
                  </button>
                ))}
                <span className="ml-3 text-base font-bold text-amber-600">{rating} / 5</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900">Detailed Feedback & Recommendations</label>
              <textarea
                rows={4}
                className="w-full p-3 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                placeholder="Highlight strengths, growth areas, key achievements, and future goals..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-olive-100 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-olive-200 bg-white text-olive-800 hover:bg-olive-50 font-semibold text-xs md:text-sm rounded-xl transition-all"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs md:text-sm rounded-xl shadow-md shadow-olive-700/20 transition-all active:scale-95 disabled:opacity-50"
                disabled={loading || (!isEditMode && reviewees.length === 0)}
              >
                <Send size={16} /> {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

};

export default ReviewForm;

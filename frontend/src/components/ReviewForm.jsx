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
    <div className="modal-overlay">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <h2>
            <FileText size={22} /> {isEditMode ? 'Complete Review' : 'Submit Performance Review'}
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {fetchingTargets ? (
          <div className="loading-spinner">Loading review details...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!isEditMode && (
              <div className="form-group">
                <label>Employee to Review</label>
                {reviewees.length === 0 ? (
                  <p className="text-warning text-sm">
                    No active mentor/mentee pairings found. An HR Admin must pair you with a mentor/mentee first.
                  </p>
                ) : (
                  <select
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
              <div className="reviewee-summary">
                <span>Reviewing: </span>
                <strong>{existingReview.revieweeId.name}</strong> ({existingReview.period})
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Review Period</label>
                <select
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

              <div className="form-group">
                <label>Review Perspective</label>
                <select
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
            <div className="form-group">
              <label>Performance Rating (1 to 5 Stars)</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star size={26} />
                  </button>
                ))}
                <span className="rating-score font-semibold">{rating} / 5</span>
              </div>
            </div>

            <div className="form-group">
              <label>Detailed Feedback & Recommendations</label>
              <textarea
                rows={5}
                placeholder="Highlight strengths, growth areas, key achievements, and future goals..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || (!isEditMode && reviewees.length === 0)}
              >
                <Send size={18} /> {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewForm;

import React, { useState, useEffect } from 'react';
import { Star, Clock, CheckCircle, Lock, Edit3, Filter, Plus, User, AlertCircle, Calendar } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewForm from './ReviewForm';

const ReviewList = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // HR passes 'all' or userId, mentor/mentee passes user.id
      const targetId = user.role === 'hr' ? 'all' : user.id;
      const res = await api.get(`/reviews/${targetId}`);
      setReviews(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch performance reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="badge badge-success"><CheckCircle size={12} /> Submitted</span>;
      case 'locked':
        return <span className="badge badge-locked"><Lock size={12} /> Locked</span>;
      default:
        return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
    }
  };

  const renderStars = (score) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            className={s <= score ? 'star-filled' : 'star-empty'}
          />
        ))}
        <span className="star-number">{score}/5</span>
      </div>
    );
  };

  return (
    <div className="section-card glass-panel">
      <div className="section-header">
        <div>
          <h2><Star size={22} /> Performance Reviews</h2>
          <p>360-degree feedback, ratings, and milestone reviews</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedReview(null);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Submit New Review
        </button>
      </div>

      {/* Filter Bar */}
      <div className="table-controls">
        <div className="filter-group">
          <Filter size={16} />
          <span>Status Filter:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses ({reviews.length})</option>
            <option value="pending">Pending ({reviews.filter((r) => r.status === 'pending').length})</option>
            <option value="submitted">Submitted ({reviews.filter((r) => r.status === 'submitted').length})</option>
            <option value="locked">Locked ({reviews.filter((r) => r.status === 'locked').length})</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={36} />
          <p>No performance reviews found matching this criteria.</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {filteredReviews.map((rev) => {
            const isReviewer = rev.reviewerId?._id === user.id || rev.reviewerId === user.id;
            const canComplete = (isReviewer || user.role === 'hr') && rev.status === 'pending';

            return (
              <div key={rev._id} className={`review-card glass-panel-sub ${rev.status}`}>
                <div className="review-card-header">
                  <div className="period-tag">
                    <Calendar size={14} /> {rev.period}
                  </div>
                  {getStatusBadge(rev.status)}
                </div>

                <div className="review-users">
                  <div className="user-pair">
                    <span className="pair-label">Reviewer:</span>
                    <span className="pair-value">{rev.reviewerId?.name || 'N/A'}</span>
                  </div>
                  <div className="user-pair">
                    <span className="pair-label">Reviewee:</span>
                    <span className="pair-value highlight">{rev.revieweeId?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="review-body">
                  <div className="rating-row">
                    <span className="rating-label">Rating:</span>
                    {renderStars(rev.rating)}
                  </div>

                  {rev.feedback ? (
                    <p className="feedback-text">"{rev.feedback}"</p>
                  ) : (
                    <p className="feedback-empty">Pending feedback submission...</p>
                  )}
                </div>

                <div className="review-card-footer">
                  <span className="created-date">
                    Deadline: {new Date(rev.deadline || rev.createdAt).toLocaleDateString()}
                  </span>

                  {canComplete && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setSelectedReview(rev);
                        setShowModal(true);
                      }}
                    >
                      <Edit3 size={14} /> Complete Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ReviewForm
          existingReview={selectedReview}
          onClose={() => setShowModal(false)}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  );
};

export default ReviewList;

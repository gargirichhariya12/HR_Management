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
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> Submitted
          </span>
        );
      case 'locked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Lock size={12} /> Locked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  const renderStars = (score) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            className={s <= score ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
          />
        ))}
        <span className="ml-1.5 text-xs font-bold text-olive-900">{score}/5</span>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white border border-olive-200 rounded-2xl shadow-sm space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-olive-950 flex items-center gap-2">
            <Star size={22} className="text-olive-700 fill-olive-700/20" /> Performance Reviews
          </h2>
          <p className="text-xs md:text-sm text-olive-600 mt-0.5">360-degree feedback, ratings, and milestone reviews</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs md:text-sm rounded-xl transition-all shadow-md shadow-olive-700/20 active:scale-95 self-start sm:self-auto"
          onClick={() => {
            setSelectedReview(null);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Submit New Review
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 text-xs font-semibold text-olive-700 pt-1">
        <Filter size={16} />
        <span>Status Filter:</span>
        <select
          className="px-3 py-1.5 bg-white border border-olive-200 rounded-xl text-xs md:text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses ({reviews.length})</option>
          <option value="pending">Pending ({reviews.filter((r) => r.status === 'pending').length})</option>
          <option value="submitted">Submitted ({reviews.filter((r) => r.status === 'submitted').length})</option>
          <option value="locked">Locked ({reviews.filter((r) => r.status === 'locked').length})</option>
        </select>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-olive-700 font-semibold text-sm">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 text-olive-500 text-sm flex flex-col items-center gap-2">
          <AlertCircle size={36} className="text-olive-400" />
          <p>No performance reviews found matching this criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((rev) => {
            const isReviewer = rev.reviewerId?._id === user.id || rev.reviewerId === user.id;
            const canComplete = (isReviewer || user.role === 'hr') && rev.status === 'pending';

            return (
              <div
                key={rev._id}
                className="p-5 bg-white border border-olive-200 hover:border-olive-300 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-olive-600 flex items-center gap-1">
                    <Calendar size={14} /> {rev.period}
                  </div>
                  {getStatusBadge(rev.status)}
                </div>

                <div className="p-3 bg-olive-50/70 border border-olive-200/60 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-olive-500">Reviewer:</span>
                    <span className="font-semibold text-olive-900">{rev.reviewerId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-olive-500">Reviewee:</span>
                    <span className="font-bold text-olive-700">{rev.revieweeId?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-olive-900">
                    <span>Rating:</span>
                    {renderStars(rev.rating)}
                  </div>

                  {rev.feedback ? (
                    <p className="text-xs italic text-olive-800 leading-relaxed bg-olive-50/40 p-2.5 rounded-lg border border-olive-100">
                      "{rev.feedback}"
                    </p>
                  ) : (
                    <p className="text-xs text-olive-400 italic">Pending feedback submission...</p>
                  )}
                </div>

                <div className="pt-3 border-t border-olive-100 flex items-center justify-between text-[11px] text-olive-500">
                  <span>Deadline: {new Date(rev.deadline || rev.createdAt).toLocaleDateString()}</span>

                  {canComplete && (
                    <button
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-olive-300 hover:bg-olive-50 text-olive-800 text-xs font-semibold rounded-lg transition-all"
                      onClick={() => {
                        setSelectedReview(rev);
                        setShowModal(true);
                      }}
                    >
                      <Edit3 size={13} /> Complete
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Shield,
  UserCheck,
  Star,
  LogOut,
  Sparkles,
  Link2,
  Clock,
  CheckCircle,
  Play,
  Award,
  BookOpen,
  Plus,
  KeyRound,
  X
} from 'lucide-react';
import api from '../services/api';
import EmployeeList from './EmployeeList';
import MentorMenteeAssign from './MentorMenteeAssign';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Change password modal states
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [changePassMsg, setChangePassMsg] = useState('');
  const [changePassError, setChangePassError] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    userCount: 0,
    assignmentCount: 0,
    pendingReviews: 0,
    submittedReviews: 0,
    myPairing: null
  });

  const [cronRunning, setCronRunning] = useState(false);
  const [cronAlert, setCronAlert] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePassMsg('');
    setChangePassError('');
    setChangePassLoading(true);

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: currentPass,
        newPassword: newPass,
        userId: user.id
      });
      setChangePassMsg(res.data.message);
      setCurrentPass('');
      setNewPass('');
      setTimeout(() => setShowChangePassModal(false), 2000);
    } catch (err) {
      setChangePassError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setChangePassLoading(false);
    }
  };


  const fetchStats = async () => {
    try {
      const targetId = user.role === 'hr' ? 'all' : user.id;
      const [reviewsRes, assignmentsRes] = await Promise.all([
        api.get(`/reviews/${targetId}`),
        api.get('/mentor-mentee')
      ]);

      const reviews = reviewsRes.data;
      const pending = reviews.filter((r) => r.status === 'pending').length;
      const submitted = reviews.filter((r) => r.status === 'submitted').length;

      let userCount = 0;
      if (user.role === 'hr') {
        const usersRes = await api.get('/users');
        userCount = usersRes.data.length;
      }

      let myPairing = null;
      if (user.role === 'mentor' && assignmentsRes.data.length > 0) {
        myPairing = assignmentsRes.data;
      } else if (user.role === 'mentee' && assignmentsRes.data.length > 0) {
        myPairing = assignmentsRes.data[0];
      }

      setStats({
        userCount,
        assignmentCount: assignmentsRes.data.length,
        pendingReviews: pending,
        submittedReviews: submitted,
        myPairing
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Trigger Cron Job endpoint
  const handleTriggerCron = async () => {
    setCronRunning(true);
    setCronAlert(null);
    try {
      const res = await api.post('/cron/trigger');
      const count = res.data.result?.count || 0;
      setCronAlert({
        type: 'success',
        message: `Cron Job executed! Checked pending reviews: ${count} overdue reminders logged/notified.`
      });
      fetchStats();
    } catch (err) {
      setCronAlert({
        type: 'error',
        message: 'Failed to run cron job: ' + (err.response?.data?.error || err.message)
      });
    } finally {
      setCronRunning(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'hr':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-olive-900 text-white border border-olive-950">
            <Shield size={13} /> HR Admin
          </span>
        );
      case 'mentor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-olive-700 text-white border border-olive-800">
            <UserCheck size={13} /> Mentor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-olive-100 text-olive-800 border border-olive-200">
            <Users size={13} /> Mentee
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-olive-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="m-4 md:m-6 px-6 py-4 bg-white border border-olive-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-olive-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-olive-700/20">
            <Sparkles size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold font-display text-olive-950 leading-tight">Antigravity HRMS</span>
            <span className="text-xs text-olive-500 font-medium">Mentor & Review Portal</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-olive-100/70 p-1 rounded-xl border border-olive-200">
          <button
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-olive-700 text-white shadow-sm'
                : 'text-olive-700 hover:text-olive-900 hover:bg-olive-200/50'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <BookOpen size={15} /> Dashboard
          </button>

          {user.role === 'hr' && (
            <>
              <button
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTab === 'employees'
                    ? 'bg-olive-700 text-white shadow-sm'
                    : 'text-olive-700 hover:text-olive-900 hover:bg-olive-200/50'
                }`}
                onClick={() => setActiveTab('employees')}
              >
                <Users size={15} /> Employees
              </button>
              <button
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTab === 'pairings'
                    ? 'bg-olive-700 text-white shadow-sm'
                    : 'text-olive-700 hover:text-olive-900 hover:bg-olive-200/50'
                }`}
                onClick={() => setActiveTab('pairings')}
              >
                <Link2 size={15} /> Mentor Mappings
              </button>
            </>
          )}

          <button
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'reviews'
                ? 'bg-olive-700 text-white shadow-sm'
                : 'text-olive-700 hover:text-olive-900 hover:bg-olive-200/50'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={15} /> Reviews
          </button>
        </div>

        {/* User Profile, Change Password & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs md:text-sm font-bold text-olive-950">{user.name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {getRoleBadge(user.role)}
              <span className="text-[11px] text-olive-500 font-medium">{user.department}</span>
            </div>
          </div>

          <button
            className="p-2 bg-olive-100 hover:bg-olive-200 border border-olive-300 text-olive-800 rounded-lg transition-all"
            onClick={() => setShowChangePassModal(true)}
            title="Change Password"
          >
            <KeyRound size={18} />
          </button>

          <button
            className="p-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg transition-all"
            onClick={logout}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>


      {/* Main Dashboard Content */}
      <main className="flex-1 px-4 md:px-6 pb-8 max-w-7xl w-full mx-auto">
        {cronAlert && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            cronAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <span>{cronAlert.message}</span>
            <button className="text-lg leading-none font-bold hover:opacity-70" onClick={() => setCronAlert(null)}>×</button>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-white via-olive-50/50 to-olive-100/40 border border-olive-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-olive-950">Welcome back, {user.name}!</h1>
                <p className="text-xs md:text-sm text-olive-600 mt-1 font-medium">
                  Role: <strong className="text-olive-900">{user.role.toUpperCase()}</strong> | Department: <strong className="text-olive-900">{user.department}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-olive-100 hover:bg-olive-200 border border-olive-300 text-olive-900 text-xs md:text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  onClick={handleTriggerCron}
                  disabled={cronRunning}
                  title="Run daily overdue review reminder check"
                >
                  <Play size={16} /> {cronRunning ? 'Running Cron...' : 'Run Cron Job'}
                </button>

                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-olive-700 hover:bg-olive-800 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md shadow-olive-700/20 active:scale-95"
                  onClick={() => setShowReviewModal(true)}
                >
                  <Plus size={16} /> Submit Review
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {user.role === 'hr' && (
                <div className="p-5 bg-white border border-olive-200 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-olive-100 text-olive-700">
                    <Users size={22} />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-olive-500 uppercase tracking-wider">Total Workforce</span>
                    <span className="text-2xl font-bold font-display text-olive-950">{stats.userCount}</span>
                  </div>
                </div>
              )}

              <div className="p-5 bg-white border border-olive-200 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-olive-100 text-olive-700">
                  <Link2 size={22} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-olive-500 uppercase tracking-wider">
                    {user.role === 'hr' ? 'Active Mentor Pairs' : user.role === 'mentor' ? 'Assigned Mentees' : 'Assigned Mentor'}
                  </span>
                  <span className="text-2xl font-bold font-display text-olive-950">
                    {user.role === 'hr'
                      ? stats.assignmentCount
                      : user.role === 'mentor'
                      ? (Array.isArray(stats.myPairing) ? stats.myPairing.length : 0)
                      : (stats.myPairing ? 1 : 0)}
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white border border-olive-200 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-700">
                  <Clock size={22} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-olive-500 uppercase tracking-wider">Pending Reviews</span>
                  <span className="text-2xl font-bold font-display text-olive-950">{stats.pendingReviews}</span>
                </div>
              </div>

              <div className="p-5 bg-white border border-olive-200 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-700">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-olive-500 uppercase tracking-wider">Completed Reviews</span>
                  <span className="text-2xl font-bold font-display text-olive-950">{stats.submittedReviews}</span>
                </div>
              </div>
            </div>

            {/* Mentor-Mentee Relationship Panel for Mentor/Mentee */}
            {user.role !== 'hr' && (
              <div className="p-6 bg-white border border-olive-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={22} className="text-olive-700" />
                  <h2 className="text-lg font-bold text-olive-950">
                    {user.role === 'mentor' ? 'My Assigned Mentees' : 'My Mentor'}
                  </h2>
                </div>

                {!stats.myPairing || (Array.isArray(stats.myPairing) && stats.myPairing.length === 0) ? (
                  <div className="text-center py-8 text-olive-500 text-sm">
                    <p>No active mentor-mentee pairing assigned yet. HR will assign your partner soon.</p>
                  </div>
                ) : user.role === 'mentee' ? (
                  <div className="p-4 bg-olive-50/70 border border-olive-200 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-olive-800 text-white font-bold flex items-center justify-center text-sm">
                      {stats.myPairing.mentorId?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <div className="font-bold text-olive-950 text-base">{stats.myPairing.mentorId?.name}</div>
                      <div className="text-xs text-olive-500">{stats.myPairing.mentorId?.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-olive-200 text-olive-800 text-[11px] font-semibold rounded">{stats.myPairing.mentorId?.department}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(stats.myPairing) &&
                      stats.myPairing.map((item) => (
                        <div key={item._id} className="p-4 bg-olive-50/70 border border-olive-200 rounded-xl flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-olive-600 text-white font-bold flex items-center justify-center text-sm">
                            {item.menteeId?.name?.charAt(0) || 'm'}
                          </div>
                          <div>
                            <div className="font-bold text-olive-950 text-base">{item.menteeId?.name}</div>
                            <div className="text-xs text-olive-500">{item.menteeId?.email}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-olive-200 text-olive-800 text-[11px] font-semibold rounded">{item.menteeId?.department}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Embedded Review List on Overview */}
            <ReviewList />
          </div>
        )}

        {activeTab === 'employees' && user.role === 'hr' && <EmployeeList />}

        {activeTab === 'pairings' && user.role === 'hr' && <MentorMenteeAssign />}

        {activeTab === 'reviews' && <ReviewList />}
      </main>

      {showReviewModal && (
        <ReviewForm
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            fetchStats();
            setActiveTab('reviews');
          }}
        />
      )}

      {showChangePassModal && (
        <div className="fixed inset-0 bg-olive-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="w-full max-w-md bg-white border border-olive-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-olive-100">
              <h3 className="text-base font-bold text-olive-950 flex items-center gap-2">
                <KeyRound size={18} className="text-olive-700" /> Change Your Password
              </h3>
              <button
                type="button"
                className="p-1 text-olive-400 hover:text-olive-900 rounded-lg transition-colors"
                onClick={() => {
                  setShowChangePassModal(false);
                  setChangePassMsg('');
                  setChangePassError('');
                }}
              >
                <X size={18} />
              </button>
            </div>

            {changePassError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {changePassError}
              </div>
            )}

            {changePassMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{changePassMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-olive-900">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3.5 py-2.5 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                  placeholder="••••••••"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-olive-900">New Password</label>
                <input
                  type="password"
                  className="w-full px-3.5 py-2.5 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                  placeholder="At least 6 characters..."
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-olive-100">
                <button
                  type="button"
                  className="px-3.5 py-2 border border-olive-200 bg-white text-olive-800 text-xs font-semibold rounded-xl"
                  onClick={() => setShowChangePassModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
                  disabled={changePassLoading}
                >
                  {changePassLoading ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

};

export default Dashboard;


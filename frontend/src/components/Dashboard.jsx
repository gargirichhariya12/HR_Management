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
  Plus
} from 'lucide-react';
import api from '../services/api';
import EmployeeList from './EmployeeList';
import MentorMenteeAssign from './MentorMenteeAssign';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
        return <span className="badge badge-hr"><Shield size={14} /> HR Admin</span>;
      case 'mentor':
        return <span className="badge badge-mentor"><UserCheck size={14} /> Mentor</span>;
      default:
        return <span className="badge badge-mentee"><Users size={14} /> Mentee</span>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar */}
      <nav className="navbar glass-panel">
        <div className="nav-brand">
          <div className="brand-logo">
            <Sparkles size={20} />
          </div>
          <div className="brand-titles">
            <span className="brand-name">Antigravity HRMS</span>
            <span className="brand-sub">Mentor & Review Portal</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BookOpen size={16} /> Dashboard
          </button>

          {user.role === 'hr' && (
            <>
              <button
                className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
                onClick={() => setActiveTab('employees')}
              >
                <Users size={16} /> Employees
              </button>
              <button
                className={`tab-btn ${activeTab === 'pairings' ? 'active' : ''}`}
                onClick={() => setActiveTab('pairings')}
              >
                <Link2 size={16} /> Mentor Mappings
              </button>
            </>
          )}

          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={16} /> Reviews
          </button>
        </div>

        {/* User Profile & Logout */}
        <div className="nav-profile">
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <div className="role-meta">
              {getRoleBadge(user.role)}
              <span className="dept-label">{user.department}</span>
            </div>
          </div>

          <button className="btn btn-logout" onClick={logout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        {cronAlert && (
          <div className={`alert alert-${cronAlert.type} alert-dismissible`}>
            <span>{cronAlert.message}</span>
            <button className="close-btn" onClick={() => setCronAlert(null)}>×</button>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="overview-space">
            {/* Header Banner */}
            <div className="welcome-banner glass-panel">
              <div className="banner-content">
                <h1>Welcome back, {user.name}!</h1>
                <p>
                  Role: <strong>{user.role.toUpperCase()}</strong> | Department: <strong>{user.department}</strong>
                </p>
              </div>

              <div className="banner-actions">
                <button
                  className="btn btn-accent"
                  onClick={handleTriggerCron}
                  disabled={cronRunning}
                  title="Run daily overdue review reminder check"
                >
                  <Play size={16} /> {cronRunning ? 'Running Cron...' : 'Run Cron Reminder Job'}
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => setShowReviewModal(true)}
                >
                  <Plus size={16} /> Submit Review
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
              {user.role === 'hr' && (
                <div className="metric-card glass-panel-sub">
                  <div className="metric-icon icon-indigo">
                    <Users size={24} />
                  </div>
                  <div className="metric-data">
                    <span className="metric-label">Total Workforce</span>
                    <span className="metric-value">{stats.userCount}</span>
                  </div>
                </div>
              )}

              <div className="metric-card glass-panel-sub">
                <div className="metric-icon icon-violet">
                  <Link2 size={24} />
                </div>
                <div className="metric-data">
                  <span className="metric-label">
                    {user.role === 'hr' ? 'Active Mentor Pairs' : user.role === 'mentor' ? 'Assigned Mentees' : 'Assigned Mentor'}
                  </span>
                  <span className="metric-value">
                    {user.role === 'hr'
                      ? stats.assignmentCount
                      : user.role === 'mentor'
                      ? (Array.isArray(stats.myPairing) ? stats.myPairing.length : 0)
                      : (stats.myPairing ? 1 : 0)}
                  </span>
                </div>
              </div>

              <div className="metric-card glass-panel-sub">
                <div className="metric-icon icon-warning">
                  <Clock size={24} />
                </div>
                <div className="metric-data">
                  <span className="metric-label">Pending Reviews</span>
                  <span className="metric-value">{stats.pendingReviews}</span>
                </div>
              </div>

              <div className="metric-card glass-panel-sub">
                <div className="metric-icon icon-success">
                  <CheckCircle size={24} />
                </div>
                <div className="metric-data">
                  <span className="metric-label">Completed Reviews</span>
                  <span className="metric-value">{stats.submittedReviews}</span>
                </div>
              </div>
            </div>

            {/* Mentor-Mentee Relationship Panel for Mentor/Mentee */}
            {user.role !== 'hr' && (
              <div className="section-card glass-panel">
                <div className="section-header">
                  <h2>
                    <Award size={22} />{' '}
                    {user.role === 'mentor' ? 'My Assigned Mentees' : 'My Mentor'}
                  </h2>
                </div>

                {!stats.myPairing || (Array.isArray(stats.myPairing) && stats.myPairing.length === 0) ? (
                  <div className="empty-state">
                    <p>No active mentor-mentee pairing assigned yet. HR will assign your partner soon.</p>
                  </div>
                ) : user.role === 'mentee' ? (
                  <div className="pairing-card glass-panel-sub">
                    <div className="user-info-cell">
                      <div className="avatar-circle avatar-mentor">
                        {stats.myPairing.mentorId?.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{stats.myPairing.mentorId?.name}</div>
                        <div className="text-sm text-muted">{stats.myPairing.mentorId?.email}</div>
                        <span className="dept-tag mt-2">{stats.myPairing.mentorId?.department}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pairings-grid">
                    {Array.isArray(stats.myPairing) &&
                      stats.myPairing.map((item) => (
                        <div key={item._id} className="pairing-card glass-panel-sub">
                          <div className="user-info-cell">
                            <div className="avatar-circle avatar-mentee">
                              {item.menteeId?.name?.charAt(0) || 'm'}
                            </div>
                            <div>
                              <div className="font-semibold text-lg">{item.menteeId?.name}</div>
                              <div className="text-sm text-muted">{item.menteeId?.email}</div>
                              <span className="dept-tag mt-2">{item.menteeId?.department}</span>
                            </div>
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
    </div>
  );
};

export default Dashboard;

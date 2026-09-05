import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Square,
  UserCheck,
  UserX,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Coffee,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Users
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TimeTracking = () => {
  const { user } = useAuth();

  // Status & Live Ticker States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [todayTotalMinutes, setTodayTotalMinutes] = useState(0);
  const [todayRecords, setTodayRecords] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Workforce & History States
  const [workforceStatus, setWorkforceStatus] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [shiftNote, setShiftNote] = useState('');
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch status and attendance data
  const fetchAttendanceStatus = async () => {
    try {
      setLoading(true);
      const [statusRes, historyRes] = await Promise.all([
        api.get('/attendance/status'),
        api.get('/attendance/my-history')
      ]);

      setIsClockedIn(statusRes.data.isClockedIn);
      setActiveSession(statusRes.data.activeSession);
      setTodayTotalMinutes(statusRes.data.todayTotalMinutes);
      setTodayRecords(statusRes.data.todayRecords || []);
      setMyHistory(historyRes.data || []);

      if (statusRes.data.activeSession?.clockIn) {
        const start = new Date(statusRes.data.activeSession.clockIn).getTime();
        const now = new Date().getTime();
        setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      } else {
        setElapsedSeconds(0);
      }

      // If HR or Mentor, fetch workforce live availability
      if (user.role === 'hr' || user.role === 'mentor') {
        const wfRes = await api.get('/attendance/all');
        setWorkforceStatus(wfRes.data.workforceStatus || []);
        setRecentLogs(wfRes.data.recentLogs || []);
      }
    } catch (err) {
      console.error('Error fetching attendance status:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load attendance data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, [user]);

  // Live Timer Ticker effect
  useEffect(() => {
    let timer = null;
    if (isClockedIn && activeSession?.clockIn) {
      timer = setInterval(() => {
        const start = new Date(activeSession.clockIn).getTime();
        const now = new Date().getTime();
        setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isClockedIn, activeSession]);

  // Clock In handler
  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      setAlert(null);
      const res = await api.post('/attendance/clock-in', { notes: shiftNote });
      setAlert({ type: 'success', message: 'You have clocked in successfully!' });
      setShiftNote('');
      await fetchAttendanceStatus();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.error || 'Failed to clock in.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Clock Out handler
  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      setAlert(null);
      const res = await api.post('/attendance/clock-out', { notes: shiftNote });
      setAlert({
        type: 'success',
        message: `Clocked out successfully! Shift duration: ${formatMinutes(res.data.attendance.durationMinutes)}`
      });
      setShiftNote('');
      await fetchAttendanceStatus();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.error || 'Failed to clock out.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatHMS = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format minutes to "Xh Ym"
  const formatMinutes = (totalMins) => {
    if (!totalMins || totalMins <= 0) return '0m';
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  // Format Date String
  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filtered Workforce Status
  const filteredWorkforce = workforceStatus.filter((item) => {
    const matchesSearch =
      item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'clocked-in') return matchesSearch && item.isClockedIn;
    if (statusFilter === 'clocked-out') return matchesSearch && !item.isClockedIn;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Alert Notification */}
      {alert && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
          <button className="text-lg font-bold hover:opacity-70" onClick={() => setAlert(null)}>
            ×
          </button>
        </div>
      )}

      {/* Main Clock In / Clock Out Hero Widget */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-white via-olive-50/70 to-olive-100/50 border border-olive-200 rounded-3xl shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left info & live duration */}
          <div className="space-y-3 text-center lg:text-left w-full lg:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-olive-100 text-olive-800 rounded-full text-xs font-semibold border border-olive-200">
              <Clock size={14} className="animate-spin-slow text-olive-700" />
              Real-Time Time Tracking
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-olive-950">
              {isClockedIn ? 'Active Work Shift' : 'Ready to Start Working?'}
            </h2>
            <p className="text-xs md:text-sm text-olive-600 font-medium max-w-md">
              {isClockedIn
                ? `Clocked in since ${formatTime(activeSession?.clockIn)}. Track your live shift duration below.`
                : 'Click "Clock In" to begin your daily shift and record your work hours.'}
            </p>

            {/* Live Counter Display */}
            <div className="pt-2">
              <div className="inline-block px-6 py-3 bg-olive-950 text-white rounded-2xl shadow-inner font-mono text-3xl md:text-4xl font-bold tracking-widest border border-olive-800">
                {isClockedIn ? formatHMS(elapsedSeconds) : '00:00:00'}
              </div>
              <span className="block mt-1 text-[11px] text-olive-500 font-medium">
                {isClockedIn ? '🟢 Live shift duration counting' : '⚪ Currently Offline'}
              </span>
            </div>
          </div>

          {/* Right Action Box & Notes */}
          <div className="w-full lg:w-96 p-5 bg-white border border-olive-200 rounded-2xl shadow-sm space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900 flex items-center gap-1.5">
                <FileText size={14} className="text-olive-700" />
                Shift Note / Activity (Optional)
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 bg-olive-50/50 border border-olive-200 rounded-xl text-xs md:text-sm text-olive-900 placeholder:text-olive-400 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                placeholder={isClockedIn ? 'e.g. Finishing frontend UI design...' : 'e.g. Morning sprint & planning...'}
                value={shiftNote}
                onChange={(e) => setShiftNote(e.target.value)}
              />
            </div>

            {/* Primary Action Button */}
            {!isClockedIn ? (
              <button
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm md:text-base rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
                onClick={handleClockIn}
                disabled={actionLoading || loading}
              >
                <Play size={18} fill="currentColor" />
                {actionLoading ? 'Clocking In...' : 'Clock In Now'}
              </button>
            ) : (
              <button
                className="w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm md:text-base rounded-xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
                onClick={handleClockOut}
                disabled={actionLoading || loading}
              >
                <Square size={18} fill="currentColor" />
                {actionLoading ? 'Clocking Out...' : 'Clock Out Shift'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-olive-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isClockedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-olive-100 text-olive-700'}`}>
            {isClockedIn ? <UserCheck size={24} /> : <UserX size={24} />}
          </div>
          <div>
            <span className="block text-xs font-semibold text-olive-500 uppercase tracking-wider">Current Status</span>
            <span className={`text-base font-bold ${isClockedIn ? 'text-emerald-700' : 'text-olive-700'}`}>
              {isClockedIn ? 'Clocked In' : 'Clocked Out'}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-olive-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-olive-100 text-olive-700">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-olive-500 uppercase tracking-wider">Total Time Today</span>
            <span className="text-xl font-bold font-display text-olive-950">{formatMinutes(todayTotalMinutes)}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-olive-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-700">
            <Clock size={24} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-olive-500 uppercase tracking-wider">First Clock In Today</span>
            <span className="text-sm font-bold text-olive-950">
              {todayRecords.length > 0 ? formatTime(todayRecords[todayRecords.length - 1].clockIn) : 'None yet'}
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-olive-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-700">
            <Coffee size={24} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-olive-500 uppercase tracking-wider">Today's Shifts</span>
            <span className="text-xl font-bold font-display text-olive-950">{todayRecords.length} Session{todayRecords.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* Workforce Live Availability Board (For HR Admin & Mentors) */}
      {(user.role === 'hr' || user.role === 'mentor') && (
        <div className="p-6 bg-white border border-olive-200 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-olive-100">
            <div className="flex items-center gap-2">
              <Users className="text-olive-700" size={20} />
              <div>
                <h3 className="text-lg font-bold text-olive-950">
                  {user.role === 'hr' ? 'Workforce Real-Time Availability' : 'My Team Live Status'}
                </h3>
                <p className="text-xs text-olive-500">Monitor live active shifts across the company</p>
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-400" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-olive-50/50 border border-olive-200 rounded-xl focus:outline-none focus:border-olive-700 text-olive-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-1.5 text-xs bg-olive-50/50 border border-olive-200 rounded-xl focus:outline-none focus:border-olive-700 text-olive-900 font-semibold"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="clocked-in">🟢 Clocked In</option>
                <option value="clocked-out">🔴 Clocked Out</option>
              </select>

              <button
                className="p-1.5 text-olive-600 hover:bg-olive-100 border border-olive-200 rounded-xl"
                onClick={fetchAttendanceStatus}
                title="Refresh Status"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Grid of Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkforce.map((item) => (
              <div
                key={item.user._id}
                className={`p-4 rounded-xl border transition-all ${
                  item.isClockedIn
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-sm'
                    : 'bg-olive-50/40 border-olive-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm text-white ${
                        item.isClockedIn ? 'bg-emerald-600' : 'bg-olive-400'
                      }`}
                    >
                      {item.user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className="block font-bold text-olive-950 text-sm leading-tight">{item.user.name}</span>
                      <span className="text-[11px] text-olive-500 block">{item.user.email}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-olive-200/70 text-olive-800 text-[10px] font-bold rounded">
                        {item.user.role.toUpperCase()} • {item.user.department}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.isClockedIn
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    {item.isClockedIn ? 'Working' : 'Offline'}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-olive-200/60 flex items-center justify-between text-xs text-olive-600">
                  <span>Today Worked: <strong>{formatMinutes(item.todayTotalMinutes)}</strong></span>
                  {item.isClockedIn && item.activeSession && (
                    <span className="text-emerald-700 font-semibold">
                      In since {formatTime(item.activeSession.clockIn)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredWorkforce.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-olive-500">
                No matching employee attendance records found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="p-6 bg-white border border-olive-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-olive-100">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-olive-700" />
            <h3 className="text-base font-bold text-olive-950">My Shift History</h3>
          </div>
          <span className="text-xs text-olive-500 font-medium">Showing recent {myHistory.length} shift logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-olive-200 text-olive-500 font-bold uppercase tracking-wider text-[11px] bg-olive-50/50">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100">
              {myHistory.map((item) => (
                <tr key={item._id} className="hover:bg-olive-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-olive-950">{item.date}</td>
                  <td className="py-3 px-4 text-olive-700 font-mono text-xs">{formatTime(item.clockIn)}</td>
                  <td className="py-3 px-4 text-olive-700 font-mono text-xs">
                    {item.clockOut ? formatTime(item.clockOut) : '— Active —'}
                  </td>
                  <td className="py-3 px-4 font-bold text-olive-900">
                    {item.status === 'clocked-out' ? formatMinutes(item.durationMinutes) : 'In Progress'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === 'clocked-in'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-olive-100 text-olive-800 border border-olive-200'
                      }`}
                    >
                      {item.status === 'clocked-in' ? '🟢 Active' : 'Completed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-olive-500 text-xs italic">{item.notes || '—'}</td>
                </tr>
              ))}

              {myHistory.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-olive-500">
                    No attendance shift records logged yet. Click "Clock In" above to start!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;

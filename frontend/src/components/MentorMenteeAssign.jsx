import React, { useState, useEffect } from 'react';
import { UserCheck, Users, Link2, Trash2, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const MentorMenteeAssign = () => {
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  // Selection states
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedMentee, setSelectedMentee] = useState('');

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, assignmentsRes] = await Promise.all([
        api.get('/users'),
        api.get('/mentor-mentee')
      ]);
      setUsers(usersRes.data);
      setAssignments(assignmentsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assignment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mentors = users.filter((u) => u.role === 'mentor');
  const mentees = users.filter((u) => u.role === 'mentee');

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMentor || !selectedMentee) {
      setError('Please select both a mentor and a mentee.');
      return;
    }

    setAssigning(true);
    try {
      const res = await api.post('/mentor-mentee', {
        mentorId: selectedMentor,
        menteeId: selectedMentee
      });
      setSuccess('Mentor and Mentee paired successfully!');
      setSelectedMentor('');
      setSelectedMentee('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to pair mentor and mentee.');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (id) => {
    if (!window.confirm('Are you sure you want to end/remove this mentor assignment?')) return;

    try {
      await api.delete(`/mentor-mentee/${id}`);
      setAssignments(assignments.filter((a) => a._id !== id));
      setSuccess('Mentor assignment removed.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove assignment.');
    }
  };

  return (
    <div className="section-card glass-panel">
      <div className="section-header">
        <div>
          <h2><Link2 size={22} /> Mentor-Mentee Assignments (HR Control)</h2>
          <p>Pair senior mentors with junior mentees to foster career development</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Assignment Creation Form */}
      <div className="assign-box glass-panel-sub">
        <h3><PlusCircle size={18} /> Pair New Mentor & Mentee</h3>
        <form onSubmit={handleAssign} className="assign-form">
          <div className="form-group">
            <label><UserCheck size={16} /> Select Mentor</label>
            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              required
            >
              <option value="">-- Choose Mentor --</option>
              {mentors.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label><Users size={16} /> Select Mentee</label>
            <select
              value={selectedMentee}
              onChange={(e) => setSelectedMentee(e.target.value)}
              required
            >
              <option value="">-- Choose Mentee --</option>
              {mentees.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={assigning}>
            <Link2 size={18} /> {assigning ? 'Pairing...' : 'Assign Pair'}
          </button>
        </form>
      </div>

      {/* Active Pairing List */}
      <div className="pairings-list">
        <h3><CheckCircle2 size={18} /> Active Mentor-Mentee Relationships ({assignments.length})</h3>

        {loading ? (
          <div className="loading-spinner">Loading relationships...</div>
        ) : assignments.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={32} />
            <p>No active mentor-mentee assignments found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Mentee</th>
                  <th>Department</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="avatar-circle avatar-mentor">
                          {item.mentorId?.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <div className="font-semibold">{item.mentorId?.name || 'N/A'}</div>
                          <div className="text-xs text-muted">{item.mentorId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-info-cell">
                        <div className="avatar-circle avatar-mentee">
                          {item.menteeId?.name?.charAt(0) || 'm'}
                        </div>
                        <div>
                          <div className="font-semibold">{item.menteeId?.name || 'N/A'}</div>
                          <div className="text-xs text-muted">{item.menteeId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.mentorId?.department || item.menteeId?.department || 'N/A'}</td>
                    <td>{new Date(item.startDate).toLocaleDateString()}</td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td className="text-right">
                      <button
                        className="btn-icon text-danger"
                        title="Remove Pair"
                        onClick={() => handleUnassign(item._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorMenteeAssign;

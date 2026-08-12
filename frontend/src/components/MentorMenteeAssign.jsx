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
    <div className="p-6 bg-white border border-olive-200 rounded-2xl shadow-sm space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link2 size={24} className="text-olive-700" />
        <div>
          <h2 className="text-xl font-bold text-olive-950">Mentor-Mentee Assignments (HR Control)</h2>
          <p className="text-xs md:text-sm text-olive-600 mt-0.5">Pair senior mentors with junior mentees to foster career development</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm rounded-xl font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs md:text-sm rounded-xl font-medium">
          {success}
        </div>
      )}

      {/* Assignment Creation Form */}
      <div className="p-5 bg-olive-50/70 border border-olive-200 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-olive-950 flex items-center gap-2">
          <PlusCircle size={18} className="text-olive-700" /> Pair New Mentor & Mentee
        </h3>
        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-olive-900 flex items-center gap-1.5">
              <UserCheck size={14} className="text-olive-700" /> Select Mentor
            </label>
            <select
              className="w-full px-3 py-2 bg-white border border-olive-200 rounded-xl text-xs md:text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
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

          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-olive-900 flex items-center gap-1.5">
              <Users size={14} className="text-olive-700" /> Select Mentee
            </label>
            <select
              className="w-full px-3 py-2 bg-white border border-olive-200 rounded-xl text-xs md:text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
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

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs md:text-sm rounded-xl shadow-md shadow-olive-700/20 transition-all active:scale-95 disabled:opacity-50 h-[38px]"
            disabled={assigning}
          >
            <Link2 size={16} /> {assigning ? 'Pairing...' : 'Assign Pair'}
          </button>
        </form>
      </div>

      {/* Active Pairing List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base font-bold text-olive-950 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" /> Active Mentor-Mentee Relationships ({assignments.length})
        </h3>

        {loading ? (
          <div className="text-center py-8 text-olive-700 font-semibold text-sm">Loading relationships...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8 text-olive-500 text-sm flex flex-col items-center gap-2">
            <AlertCircle size={32} className="text-olive-400" />
            <p>No active mentor-mentee assignments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-olive-200">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-olive-50/80 text-olive-900 font-bold uppercase text-[11px] tracking-wider border-b border-olive-200">
                  <th className="p-3.5">Mentor</th>
                  <th className="p-3.5">Mentee</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Start Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-100">
                {assignments.map((item) => (
                  <tr key={item._id} className="hover:bg-olive-50/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-olive-800 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {item.mentorId?.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <div className="font-bold text-olive-950">{item.mentorId?.name || 'N/A'}</div>
                          <div className="text-[11px] text-olive-500">{item.mentorId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-olive-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {item.menteeId?.name?.charAt(0) || 'm'}
                        </div>
                        <div>
                          <div className="font-bold text-olive-950">{item.menteeId?.name || 'N/A'}</div>
                          <div className="text-[11px] text-olive-500">{item.menteeId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-olive-800">{item.mentorId?.department || item.menteeId?.department || 'N/A'}</td>
                    <td className="p-3.5 text-olive-600">{new Date(item.startDate).toLocaleDateString()}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

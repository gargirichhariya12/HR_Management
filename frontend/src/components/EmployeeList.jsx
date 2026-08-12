import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, UserCheck, Filter, AlertCircle, KeyRound, Copy, Check, X } from 'lucide-react';
import api from '../services/api';
import EmployeeForm from './EmployeeForm';

const EmployeeList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // HR Reset Token Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [generatedResetUrl, setGeneratedResetUrl] = useState('');
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"?`)) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete employee.');
    }
  };

  const handleGenerateResetLink = async (userObj) => {
    setResetLoading(true);
    setResetTargetUser(userObj);
    setCopied(false);
    try {
      const res = await api.post(`/users/${userObj._id}/reset-token`);
      const fullUrl = `${window.location.origin}/?token=${res.data.resetToken}`;
      setGeneratedResetUrl(fullUrl);
      setShowResetModal(true);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate reset link.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedResetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'hr':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-olive-900 text-white border border-olive-950">
            <Shield size={12} /> HR Admin
          </span>
        );
      case 'mentor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-olive-700 text-white border border-olive-800">
            <UserCheck size={12} /> Mentor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-olive-100 text-olive-800 border border-olive-200">
            <Users size={12} /> Mentee
          </span>
        );
    }
  };

  return (
    <div className="p-6 bg-white border border-olive-200 rounded-2xl shadow-sm space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-olive-950 flex items-center gap-2">
            <Users size={22} className="text-olive-700" /> Employee Directory (HR Management)
          </h2>
          <p className="text-xs md:text-sm text-olive-600 mt-0.5">Full control over company staff, roles, and password authorizations</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs md:text-sm rounded-xl transition-all shadow-md shadow-olive-700/20 active:scale-95 self-start sm:self-auto"
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
        >
          <UserPlus size={18} /> Add New Employee
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-white border border-olive-200 rounded-xl text-xs md:text-sm text-olive-900 placeholder:text-olive-400 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
            placeholder="Search by name, email or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-olive-700">
          <Filter size={16} />
          <span>Role:</span>
          <select
            className="px-3 py-2 bg-white border border-olive-200 rounded-xl text-xs md:text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="hr">HR Admin</option>
            <option value="mentor">Mentors</option>
            <option value="mentee">Mentees</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-olive-700 font-semibold text-sm">Loading employees...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-olive-500 text-sm flex flex-col items-center gap-2">
          <AlertCircle size={36} className="text-olive-400" />
          <p>No employees match your search criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-olive-200">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-olive-50/80 text-olive-900 font-bold uppercase text-[11px] tracking-wider border-b border-olive-200">
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Status / Requests</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-olive-50/50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-olive-700 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-olive-950">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-olive-700">{u.email}</td>
                  <td className="p-3.5">{getRoleBadge(u.role)}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-olive-100 text-olive-800 rounded-md text-xs font-medium">
                      {u.department || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {u.resetRequested ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        <KeyRound size={12} /> Reset Requested
                      </span>
                    ) : (
                      <span className="text-olive-400 text-xs">Active</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Generate Password Reset Link for Employee"
                        onClick={() => handleGenerateResetLink(u)}
                        disabled={resetLoading}
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        className="p-1.5 text-olive-700 hover:bg-olive-100 rounded-lg transition-colors"
                        title="Edit User"
                        onClick={() => {
                          setEditingUser(u);
                          setShowModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                        onClick={() => handleDelete(u._id, u.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <EmployeeForm
          initialData={editingUser}
          onClose={() => setShowModal(false)}
          onSuccess={fetchUsers}
        />
      )}

      {/* HR Reset Link Modal */}
      {showResetModal && resetTargetUser && (
        <div className="fixed inset-0 bg-olive-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="w-full max-w-lg bg-white border border-olive-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-olive-100">
              <h3 className="text-base font-bold text-olive-950 flex items-center gap-2">
                <KeyRound size={18} className="text-olive-700" /> Authorized Password Reset Link
              </h3>
              <button
                type="button"
                className="p-1 text-olive-400 hover:text-olive-900 rounded-lg transition-colors"
                onClick={() => setShowResetModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-olive-50 border border-olive-200 rounded-xl text-xs text-olive-800 space-y-1">
              <p>Employee: <strong className="text-olive-950 font-bold">{resetTargetUser.name}</strong> ({resetTargetUser.email})</p>
              <p className="text-olive-600">As HR Admin, you have authorized a password reset for this employee.</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900">Generated Password Reset URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  className="w-full p-2.5 bg-olive-50 border border-olive-200 rounded-xl text-xs font-mono text-olive-900 focus:outline-none select-all"
                  value={generatedResetUrl}
                />
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0 active:scale-95"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-olive-900 text-white font-semibold text-xs rounded-xl"
                onClick={() => setShowResetModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;


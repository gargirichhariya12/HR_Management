import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, UserCheck } from 'lucide-react';
import api from '../services/api';

const EmployeeForm = ({ initialData, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('mentee');
  const [department, setDepartment] = useState('Engineering');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setRole(initialData.role || 'mentee');
      setDepartment(initialData.department || 'Engineering');
      setPassword(''); // Password blank on edit unless updating
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/users/${initialData._id}`, {
          name,
          email,
          role,
          department,
          ...(password ? { password } : {})
        });
      } else {
        await api.post('/users', {
          name,
          email,
          password: password || 'password123',
          role,
          department
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-olive-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="w-full max-w-lg bg-white border border-olive-200 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-olive-100">
          <h2 className="text-lg font-bold text-olive-950 flex items-center gap-2">
            {isEdit ? <UserCheck size={20} className="text-olive-700" /> : <UserPlus size={20} className="text-olive-700" />}
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-olive-900">Full Name</label>
            <input
              type="text"
              className="w-full px-3.5 py-2 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
              placeholder="e.g. Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-olive-900">Email Address</label>
            <input
              type="email"
              className="w-full px-3.5 py-2 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
              placeholder="jordan@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-olive-900">
              {isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              className="w-full px-3.5 py-2 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
              placeholder={isEdit ? '••••••••' : 'password123'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900">Role</label>
              <select
                className="w-full px-3 py-2 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="hr">HR Admin</option>
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900">Department</label>
              <select
                className="w-full px-3 py-2 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
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
              disabled={loading}
            >
              <Save size={16} /> {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default EmployeeForm;

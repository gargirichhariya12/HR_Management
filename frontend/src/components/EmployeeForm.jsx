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
    <div className="modal-overlay">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <h2>
            {isEdit ? <UserCheck size={22} /> : <UserPlus size={22} />}
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="jordan@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{isEdit ? 'New Password (leave blank to keep current)' : 'Password'}</label>
            <input
              type="password"
              placeholder={isEdit ? '••••••••' : 'password123'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="hr">HR Admin</option>
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;

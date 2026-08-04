import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, UserCheck, Filter, AlertCircle } from 'lucide-react';
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
        return <span className="badge badge-hr"><Shield size={12} /> HR Admin</span>;
      case 'mentor':
        return <span className="badge badge-mentor"><UserCheck size={12} /> Mentor</span>;
      default:
        return <span className="badge badge-mentee"><Users size={12} /> Mentee</span>;
    }
  };

  return (
    <div className="section-card glass-panel">
      <div className="section-header">
        <div>
          <h2><Users size={22} /> Employee Directory (HR Management)</h2>
          <p>Full control over company staff, roles, and departments</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
        >
          <UserPlus size={18} /> Add New Employee
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="table-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="hr">HR Admin</option>
            <option value="mentor">Mentors</option>
            <option value="mentee">Mentees</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading employees...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={36} />
          <p>No employees match your search criteria.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="avatar-circle">{u.name.charAt(0)}</div>
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td><span className="dept-tag">{u.department || 'N/A'}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button
                        className="btn-icon text-info"
                        title="Edit User"
                        onClick={() => {
                          setEditingUser(u);
                          setShowModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon text-danger"
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
    </div>
  );
};

export default EmployeeList;

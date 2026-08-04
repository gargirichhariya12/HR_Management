import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, Users, ArrowRight, Lock, Mail, UserPlus, LogIn, Sparkles } from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('mentee');
  const [department, setDepartment] = useState('Engineering');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(name, email, password, role, department);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login handlers
  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
    } catch (err) {
      setError('Demo login failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="brand-badge">
            <Sparkles size={20} className="text-primary-glow" />
            <span>Enterprise HRMS</span>
          </div>
          <h1>Mentor & Review Portal</h1>
          <p>Streamlined employee growth, mentor pairing, and 360° reviews</p>
        </div>

        {/* Demo Quick Logins */}
        <div className="demo-accounts-box">
          <p className="demo-title">⚡ Quick Demo Login (One-click access)</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-demo btn-hr"
              onClick={() => handleDemoLogin('hr@company.com')}
              disabled={loading}
            >
              <Shield size={16} /> HR Admin
            </button>
            <button
              type="button"
              className="btn btn-demo btn-mentor"
              onClick={() => handleDemoLogin('mentor@company.com')}
              disabled={loading}
            >
              <UserCheck size={16} /> Mentor
            </button>
            <button
              type="button"
              className="btn btn-demo btn-mentee"
              onClick={() => handleDemoLogin('mentee@company.com')}
              disabled={loading}
            >
              <Users size={16} /> Mentee
            </button>
          </div>
        </div>

        <div className="form-divider">
          <span>or continue with credentials</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegisterMode && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegisterMode && (
            <>
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
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              'Processing...'
            ) : isRegisterMode ? (
              <>
                <UserPlus size={18} /> Create Account
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegisterMode ? (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsRegisterMode(false)} className="link-btn">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsRegisterMode(true)} className="link-btn">
                Register New User
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

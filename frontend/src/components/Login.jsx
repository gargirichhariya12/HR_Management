import { ArrowRight, Lock, LogIn, Mail, Shield, Sparkles, UserCheck, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-primary mx-auto">
            <Sparkles size={20} />
            <span>Enterprise HRMS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">Mentor & Review Portal</h1>
          <p className="text-sm text-slate-600 mt-1">Streamlined employee growth, mentor pairing, and 360° reviews</p>
        </div>

        {/* Demo Quick Logins */}
        <div className="bg-gray-50 border border-gray-100 rounded-md p-4 mb-4">
          <p className="text-xs font-semibold text-slate-600 uppercase text-center mb-2">⚡ Quick Demo Login (One-click access)</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm bg-red-50 border border-red-100 text-red-600 disabled:opacity-50"
              onClick={() => handleDemoLogin('hr@company.com')}
              disabled={loading}
            >
              <Shield size={16} /> HR
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm bg-primary/10 border border-primary/20 text-primary disabled:opacity-50"
              onClick={() => handleDemoLogin('mentor@company.com')}
              disabled={loading}
            >
              <UserCheck size={16} /> Mentor
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm bg-teal-50 border border-teal-100 text-teal-600 disabled:opacity-50"
              onClick={() => handleDemoLogin('mentee@company.com')}
              disabled={loading}
            >
              <Users size={16} /> Mentee
            </button>
          </div>
        </div>

        <div className="flex items-center my-4">
          <hr className="flex-1 border-t border-gray-200" />
          <span className="px-3 text-xs text-slate-500">or continue with credentials</span>
          <hr className="flex-1 border-t border-gray-200" />
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-600">Full Name</label>
              <input
                className="w-full px-4 py-2 border border-gray-200 rounded-md bg-white text-slate-900"
                type="text"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-600">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-white text-slate-900"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-600">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-white text-slate-900"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegisterMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-600">Role</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-md bg-white text-slate-900" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="hr">HR Admin</option>
                  <option value="mentor">Mentor</option>
                  <option value="mentee">Mentee</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-600">Department</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-md bg-white text-slate-900" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md font-semibold disabled:opacity-50" disabled={loading}>
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

        <div className="text-center mt-4 text-sm text-slate-600">
          {isRegisterMode ? (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsRegisterMode(false)} className="text-primary font-semibold underline">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsRegisterMode(true)} className="text-primary font-semibold underline">
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

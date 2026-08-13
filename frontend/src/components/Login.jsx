import { ArrowRight, Lock, LogIn, Mail, Shield, Sparkles, UserCheck, Users, KeyRound, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { login, googleLogin } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Reset token in URL handler
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tokenSuccess, setTokenSuccess] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const errorParam = params.get('error');

    if (tokenParam) {
      setResetToken(tokenParam);
    }

    if (errorParam === 'unregistered_id') {
      setError('This is not a registered ID. Please contact HR for the registered ID and password.');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam) {
      setError('Authentication failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleGoogleAuth = () => {
    // Redirect to the backend Passport.js Google OAuth route
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setResetMsg('');
    setResetError('');
    setResetLoading(true);

    try {
      const res = await api.post('/auth/request-reset', { email: resetEmail });
      setResetMsg(res.data.message);
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to submit reset request.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetWithTokenSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTokenSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword
      });
      setTokenSuccess(res.data.message);
      setTimeout(() => {
        setResetToken(null);
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olive-50 p-4 font-sans">
      <div className="w-full max-w-md p-8 bg-white border border-olive-200 rounded-2xl shadow-xl shadow-olive-900/5 transition-all">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-olive-100/80 border border-olive-200 px-3.5 py-1 rounded-full text-xs font-semibold text-olive-800 mb-3 mx-auto">
            <Sparkles size={16} className="text-olive-700" />
            <span>Enterprise HRMS</span>
          </div>
          <h1 className="text-2xl font-bold text-olive-950">Mentor & Review Portal</h1>
          <p className="text-xs md:text-sm text-olive-600 mt-1">Streamlined employee growth, mentor pairing, and 360° reviews</p>
        </div>

        {/* HR Authority Notice */}
        <div className="mb-6 p-3 bg-olive-50 border border-olive-200/80 rounded-xl text-xs text-olive-800 flex items-start gap-2">
          <Shield size={16} className="text-olive-700 shrink-0 mt-0.5" />
          <span>
            <strong className="text-olive-950 font-bold">HR Authority System:</strong> New employee accounts are strictly provisioned by HR Admins.
          </span>
        </div>

        {/* Demo Quick Logins */}
        <div className="bg-olive-50/70 border border-dashed border-olive-300 rounded-xl p-3.5 mb-6">
          <p className="text-[11px] font-bold text-olive-800 uppercase tracking-wider text-center mb-2.5">⚡ Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-lg bg-olive-900 text-white hover:bg-olive-950 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              onClick={() => handleDemoLogin('hr@company.com')}
              disabled={loading}
            >
              <Shield size={13} /> HR Admin
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-lg bg-olive-700 text-white hover:bg-olive-800 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              onClick={() => handleDemoLogin('mentor@company.com')}
              disabled={loading}
            >
              <UserCheck size={13} /> Mentor
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-lg bg-olive-500 text-white hover:bg-olive-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              onClick={() => handleDemoLogin('mentee@company.com')}
              disabled={loading}
            >
              <Users size={13} /> Mentee
            </button>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-olive-300 hover:bg-olive-50 text-olive-900 font-semibold text-xs md:text-sm rounded-xl shadow-sm transition-all active:scale-[0.99]"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-olive-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] text-olive-500 font-semibold uppercase tracking-wider">or sign in with email</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {tokenSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{tokenSuccess}</span>
          </div>
        )}

        {resetToken ? (
          /* Password Reset Screen (From HR Link) */
          <form onSubmit={handleResetWithTokenSubmit} className="space-y-4">
            <div className="p-3 bg-olive-100/70 border border-olive-200 rounded-xl text-xs text-olive-900 font-semibold mb-2">
              HR Password Reset Token Active
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900">New Password</label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                placeholder="At least 6 characters..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                placeholder="Re-enter new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-olive-700/20 transition-all active:scale-[0.99] disabled:opacity-50"
              disabled={loading}
            >
              <KeyRound size={16} /> Save New Password
            </button>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-olive-900">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-olive-900">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-olive-700 hover:text-olive-950 font-semibold underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-olive-700/20 transition-all active:scale-[0.99] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn size={18} /> Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-olive-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white border border-olive-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-olive-100">
              <h3 className="text-base font-bold text-olive-950 flex items-center gap-2">
                <KeyRound size={18} className="text-olive-700" /> Request Password Reset
              </h3>
              <button
                type="button"
                className="p-1 text-olive-400 hover:text-olive-900 rounded-lg transition-colors"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetMsg('');
                  setResetError('');
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-olive-600 leading-relaxed">
              If you forgot your password, enter your registered email below. A reset notification will be sent to HR, who has the exclusive authority to issue your password reset link.
            </p>

            {resetError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {resetError}
              </div>
            )}

            {resetMsg ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle size={16} /> Request Received
                </div>
                <p>{resetMsg}</p>
                <button
                  type="button"
                  className="w-full mt-2 py-1.5 bg-emerald-700 text-white font-semibold rounded-lg text-xs"
                  onClick={() => setShowForgotModal(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-olive-900">Your Registered Email</label>
                  <input
                    type="email"
                    className="w-full px-3.5 py-2.5 bg-white border border-olive-200 rounded-xl text-sm text-olive-900 placeholder:text-olive-300 focus:outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-700/20 transition-all"
                    placeholder="you@company.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="px-3.5 py-2 border border-olive-200 bg-white text-olive-800 text-xs font-semibold rounded-xl"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Submitting...' : 'Submit to HR'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;

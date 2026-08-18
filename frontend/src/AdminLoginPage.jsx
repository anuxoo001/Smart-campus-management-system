import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from './store/authSlice';
import { Link } from 'react-router-dom';

function AdminLoginPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    const { email, password } = formData;

    if (!email.trim()) {
      setMessage('Please enter your admin email address.');
      return;
    }

    if (!password.trim()) {
      setMessage('Please enter your password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      await dispatch(loginUser({ email: email.trim(), password })).unwrap();
      setMessage('Login successful! Redirecting...');
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Invalid admin credentials.';
      setMessage(errorMessage);
      setFormData((prev) => ({
        ...prev,
        password: '',
      }));
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-page">
        <div className="auth-card-shell">
          {/* Left Panel - Branding */}
          <div className="auth-panel auth-panel-brand admin-brand">
            <div className="auth-branding">
              <div className="auth-brand-icon">🛡️</div>
              <h1>Administrator Login</h1>
              <p>Restricted Campus Administration</p>
            </div>
            <div className="auth-brand-features">
              <div className="feature">
                <div className="feature-icon">✓</div>
                <h3>Full Control</h3>
                <p>Create teacher & student accounts</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h3>Central Management</h3>
                <p>Manage users and campus operations</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <h3>Secure Access</h3>
                <p>Restricted to authorized staff</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="auth-panel auth-panel-form">
            <div className="auth-header">
              <h2>Admin Portal</h2>
              <p className="auth-subtitle">Sign in with your administrator credentials</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              {/* Email Field */}
              <div className="form-group">
                <label>Admin Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@institution.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoFocus
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Messages */}
              {message && (
                <div className={`message ${error ? 'error-message' : 'success-message'}`}>
                  {message}
                </div>
              )}

              {error && (
                <p className="error-message">{error}</p>
              )}

              {/* Login Button */}
              <button
                className="btn btn-primary full-width"
                type="submit"
                disabled={loading || !formData.email.trim() || !formData.password.trim()}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="auth-divider">
                <span>or</span>
              </div>

              {/* Switch to other logins */}
              <Link to="/login/teacher" className="btn btn-secondary full-width">
                ← Teacher Login
              </Link>
              <Link to="/login/student" className="btn btn-secondary full-width">
                ← Student Login
              </Link>
            </form>

            {/* Footer */}
            <div className="auth-links">
              <span>Authorized personnel only. </span>
              <Link to="/login">Back to login selection</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
import { Link } from 'react-router-dom';
import './LoginTypeSelector.css';

export default function LoginTypeSelector() {
  return (
    <div className="auth-shell">
      <div className="auth-page">
        <div className="login-type-container">
          {/* Header */}
          <div className="login-type-header">
            <div className="brand-mark large">SC</div>
            <h1>Smart Campus</h1>
            <p>Student Success Platform</p>
          </div>

          {/* Login Type Selection Cards */}
          <div className="login-type-grid">
            {/* Student Login Card */}
            <Link to="/login/student" className="login-type-card student-card">
              <div className="card-icon">👨‍🎓</div>
              <h2>Student Login</h2>
              <p>Sign in with your email</p>
              <div className="card-features">
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Email-based OTP authentication</span>
                </div>
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>View assigned tasks</span>
                </div>
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Track progress & submissions</span>
                </div>
              </div>
              <div className="card-action">
                <span className="btn-text">Sign in as Student →</span>
              </div>
            </Link>

            {/* Teacher Login Card */}
            <Link to="/login/teacher" className="login-type-card teacher-card">
              <div className="card-icon">👩‍🏫</div>
              <h2>Teacher Login</h2>
              <p>Sign in with your credentials</p>
              <div className="card-features">
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Secure ID & Password login</span>
                </div>
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Create & manage tasks</span>
                </div>
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Track student submissions</span>
                </div>
              </div>
              <div className="card-action">
                <span className="btn-text">Sign in as Teacher →</span>
              </div>
            </Link>

            {/* Admin Login Card */}
            <Link to="/login/admin" className="login-type-card admin-card">
              <div className="card-icon">🛡️</div>
              <h2>Administrator Login</h2>
              <p>Restricted to campus administration</p>
              <div className="card-features">
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Secure admin credentials</span>
                </div>
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Create teacher & student accounts</span>
                </div>
                <div className="feature">
                  <span className="icon">✓</span>
                  <span>Manage users & campus operations</span>
                </div>
              </div>
              <div className="card-action">
                <span className="btn-text">Sign in as Administrator →</span>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="login-type-footer">
            <p>Don't have an account? <Link to="/register">Create one now</Link></p>
            <p className="help-text">Need help? <Link to="/contact-support">Contact Support</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

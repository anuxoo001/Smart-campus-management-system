import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTP, resendOTP } from './store/authSlice';
import { Link } from 'react-router-dom';

function SMSLoginPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const testEmail = import.meta.env.VITE_TEST_EMAIL || 'anuxoo001@gmail.com';

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    return () => setMessage('');
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage('');

    const normalizedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setMessage('Please enter your email address.');
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      await dispatch(sendOTP({ email: normalizedEmail })).unwrap();
      setStep('otp');
      setTimer(60);
      setAttempts(0);
      setMessage(`OTP sent successfully! Check ${normalizedEmail} for the code.`);
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Failed to send OTP. Please try again.';
      setMessage(errorMessage);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!otp.trim() || otp.length !== 6) {
      setMessage('Please enter a valid 6-digit OTP.');
      return;
    }

    if (attempts >= 5) {
      setMessage('Maximum attempts exceeded. Please request a new OTP.');
      return;
    }

    try {
      await dispatch(verifyOTP({ email: email.trim(), otp })).unwrap();
      setMessage('Login successful! Redirecting...');
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const errorMessage = typeof err === 'string' ? err : 'Invalid email or OTP.';
      if (newAttempts >= 5) {
        setMessage('Maximum attempts exceeded. Please request a new OTP.');
      } else {
        setMessage(errorMessage);
      }
      setOtp('');
    }
  };

  const handleResendOTP = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await dispatch(resendOTP({ email: email.trim() })).unwrap();
      setTimer(60);
      setAttempts(0);
      setOtp('');
      setMessage('New OTP sent successfully!');
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Failed to resend OTP. Please try again.';
      setMessage(errorMessage);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setMessage('');
    setAttempts(0);
  };

  return (
    <div className="auth-shell">
      <div className="auth-page">
        <div className="auth-card-shell">
          {/* Left Panel - Branding */}
          <div className="auth-panel auth-panel-brand">
            <div className="auth-branding">
              <div className="auth-brand-icon">✉️</div>
              <h1>Smart Campus</h1>
              <p>Secure Email OTP Authentication</p>
            </div>
            <div className="auth-brand-features">
              <div className="feature">
                <div className="feature-icon">✓</div>
                <h3>Secure Access</h3>
                <p>One-Time Passwords via Email</p>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h3>Fast Login</h3>
                <p>Instant verification in seconds</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <h3>Protected</h3>
                <p>Your account is always secure</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="auth-panel auth-panel-form">
            <div className="auth-header">
              <h2>{step === 'email' ? 'Sign in with Email OTP' : 'Verify OTP'}</h2>
              <p className="auth-subtitle">
                {step === 'email'
                  ? `Use your verified test inbox: ${testEmail}`
                  : `We've sent an OTP to ${email}`}
              </p>
            </div>

            {step === 'email' ? (
              <form className="auth-form" onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                    <span className="input-icon">✉️</span>
                  </div>
                  <small className="input-hint">
                    Use your registered email address
                  </small>
                </div>

                {message && (
                  <div className={`message ${error ? 'error-message' : 'success-message'}`}>
                    {message}
                  </div>
                )}

                {error && (
                  <p className="error-message">
                    {error}
                  </p>
                )}

                <button
                  className="btn btn-primary full-width"
                  type="submit"
                  disabled={loading || !email.trim()}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                <Link to="/forgot-password" className="btn btn-secondary full-width">
                  Forgot Password?
                </Link>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label>One-Time Password</label>
                  <div className="otp-input-wrapper">
                    <input
                      type="text"
                      placeholder="000000"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setOtp(val);
                      }}
                      disabled={loading}
                      autoFocus
                      className="otp-input"
                    />
                    <span className="input-icon">🔐</span>
                  </div>
                  <small className="input-hint">
                    Enter the 6-digit code sent to your email
                  </small>
                </div>

                {message && (
                  <div className={`message ${error ? 'error-message' : 'success-message'}`}>
                    {message}
                  </div>
                )}

                {error && (
                  <p className="error-message">
                    {error}
                  </p>
                )}

                <button
                  className="btn btn-primary full-width"
                  type="submit"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="otp-actions">
                  {timer > 0 ? (
                    <p className="timer">
                      Resend OTP in <strong>{timer}s</strong>
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="btn-link"
                      onClick={handleResendOTP}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary full-width"
                  onClick={handleBackToEmail}
                  disabled={loading}
                >
                  Back to Email
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="auth-links">
              <span>Don't have an account? </span>
              <Link to="/register">Create account</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .input-wrapper,
        .otp-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-wrapper input,
        .otp-input-wrapper input {
          flex: 1;
          padding-right: 40px;
        }

        .input-icon {
          position: absolute;
          right: 12px;
          font-size: 18px;
          pointer-events: none;
          color: #999;
        }

        .input-hint {
          display: block;
          color: #999;
          font-size: 12px;
          margin-top: 6px;
        }

        .otp-input {
          font-size: 32px;
          letter-spacing: 10px;
          text-align: center;
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }

        .otp-actions {
          text-align: center;
          margin: 16px 0;
        }

        .timer {
          color: #667eea;
          font-size: 14px;
          margin: 0;
        }

        .btn-link {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 0;
          transition: color 0.3s ease;
        }

        .btn-link:hover:not(:disabled) {
          color: #764ba2;
          text-decoration: underline;
        }

        .btn-link:disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        .message {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .success-message {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .auth-brand-features {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .feature {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .feature-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .feature h3 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .feature p {
          margin: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          gap: 12px;
        }

        .auth-divider span {
          color: #999;
          font-size: 12px;
          font-weight: 600;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background-color: #e0e0e0;
        }

        .btn-secondary {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #e0e0e0;
          margin-top: 12px;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #efefef;
          border-color: #d0d0d0;
        }

        @media (max-width: 768px) {
          .auth-card-shell {
            flex-direction: column;
          }

          .auth-panel {
            min-height: auto;
          }

          .auth-panel-brand {
            padding: 30px;
            border-radius: 0;
          }

          .auth-brand-features {
            margin-top: 20px;
            gap: 15px;
          }

          .otp-input {
            font-size: 24px;
            letter-spacing: 6px;
          }
        }
      `}</style>
    </div>
  );
}

export default SMSLoginPage;

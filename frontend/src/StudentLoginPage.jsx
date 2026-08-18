import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTP, resendOTP } from './store/authSlice';
import { Link } from 'react-router-dom';

function StudentLoginPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const testEmail = import.meta.env.VITE_TEST_EMAIL || 'anuxoo001@gmail.com';
  const sandboxMode = import.meta.env.VITE_USE_TEST_EMAIL === 'true';

  useEffect(() => {
    if (sandboxMode) {
      setEmail(testEmail);
    }
  }, [sandboxMode, testEmail]);

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

    if (sandboxMode && normalizedEmail.toLowerCase() !== testEmail.toLowerCase()) {
      const forcedEmail = testEmail;
      setEmail(forcedEmail);
      setMessage(`Sandbox mode is active. Use the verified inbox: ${forcedEmail}`);
      return;
    }

    try {
      const result = await dispatch(sendOTP({ email: normalizedEmail })).unwrap();
      setStep('otp');
      setTimer(60);
      setAttempts(0);

      if (result?.sandboxFallback) {
        setMessage(`OTP generated in test mode. Check the backend console for the code. Debug OTP: ${result.debugOtp}`);
      } else {
        setMessage(`OTP sent successfully! Check ${normalizedEmail} for the code.`);
      }
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
      const result = await dispatch(resendOTP({ email: email.trim() })).unwrap();
      setTimer(60);
      setAttempts(0);
      setOtp('');

      if (result?.sandboxFallback) {
        setMessage(`New OTP generated in test mode. Check the backend console for the code. Debug OTP: ${result.debugOtp}`);
      } else {
        setMessage('New OTP sent successfully!');
      }
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
              <div className="auth-brand-icon">🎓</div>
              <h1>Student Login</h1>
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
                      value={sandboxMode ? testEmail : email}
                      onChange={(e) => {
                        if (!sandboxMode) setEmail(e.target.value);
                      }}
                      disabled={loading || sandboxMode}
                      readOnly={sandboxMode}
                      autoFocus
                    />
                    <span className="input-icon">✉️</span>
                  </div>
                  <small className="input-hint">
                    {sandboxMode
                      ? `Sandbox mode is active. Use only the verified test inbox: ${testEmail}`
                      : `Use your registered student email address`}
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

                <Link to="/login/teacher" className="btn btn-secondary full-width">
                  Teacher Login →
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
              <p>Contact your administrator to create a new account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLoginPage;

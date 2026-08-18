const express = require('express');
const { 
  registerStudent, 
  verifyEmail, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  forgotPassword, 
  resetPassword,
  sendLoginOTP,
  verifyLoginOTP,
  resendLoginOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Email/Password auth
router.post('/register', registerStudent);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// SMS OTP auth
router.post('/send-otp', sendLoginOTP);
router.post('/verify-otp', verifyLoginOTP);
router.post('/resend-otp', resendLoginOTP);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getCurrentUser);

module.exports = router;

const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/emailService');
const { generateOTP, sendSMSViaTwilio } = require('../utils/smsService');
const { normalizePhoneNumber } = require('../utils/phoneService');

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, phone, studentId, department, course, semester, batch } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      phone,
      role: 'student',
      isEmailVerified: false,
    });

    let student = null;
    const hasStudentProfile = studentId || department || course || semester || batch;
    if (hasStudentProfile) {
      student = await Student.create({
        user: user._id,
        studentId,
        department,
        course,
        semester,
        batch,
      });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(emailVerificationToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyLink = `${clientUrl}/verify-email?token=${emailVerificationToken}`;

    sendEmail(user.email, 'verifyEmail', [user.name, verifyLink])
      .catch((err) => console.error('Failed to send verification email:', err.message));

    res.status(201).json({
      message: 'Student registered successfully. Please verify your email to log in.',
      user: { ...user.toObject(), password: undefined },
      token: generateToken(user._id),
      student,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with that email, a reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    sendEmail(user.email, 'resetPassword', [user.name, resetLink])
      .catch((err) => console.error('Failed to send reset email:', err.message));

    res.status(200).json({
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Send login notification email (non-blocking)
    const loginTime = new Date().toLocaleString();
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    
    sendEmail(user.email, 'loginNotification', [user.name, user.email, loginTime, ipAddress])
      .catch((err) => console.error('Failed to send login email:', err.message));

    res.json({
      message: 'Login successful.',
      token: generateToken(user._id),
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully.' });
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('department course');
    }
    if (user.role === 'faculty') {
      profile = await Faculty.findOne({ user: user._id }).populate('department subjects');
    }

    res.json({ user, profile });
  } catch (error) {
    next(error);
  }
};

// Update the current user's profile (name, phone)
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (profileImage !== undefined) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Send email OTP for login
 * User enters email and receives a one-time password via email
 */
const sendLoginOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === '') {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        message: 'If an account with this email exists, an OTP has been sent.',
        success: true,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    const otp = generateOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    user.smsOTP = hashedOTP;
    user.smsOTPExpires = Date.now() + 10 * 60 * 1000;
    user.smsOTPAttempts = 0;
    await user.save();

    try {
      await sendEmail(user.email, 'loginOTP', [user.name, otp]);
    } catch (emailError) {
      console.error('OTP email sending failed:', emailError.message);

      if (process.env.USE_TEST_EMAIL === 'true' || process.env.USE_TEST_EMAIL === '1') {
        console.warn(`\n[OTP TEST MODE FALLBACK] User: ${user.email} | OTP: ${otp}\n`);
        return res.status(200).json({
          message: 'OTP generated in test mode. Check the backend console for the OTP code.',
          success: true,
          debugOtp: otp,
          sandboxFallback: true,
        });
      }

      return res.status(500).json({
        message: 'OTP could not be delivered to this email. Please use a verified email address or contact support.',
        details: emailError.message,
      });
    }

    res.status(200).json({
      message: 'OTP sent successfully to your email.',
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email OTP and login user
 */
const verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or OTP.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    if (!user.smsOTPExpires || user.smsOTPExpires < Date.now()) {
      return res.status(401).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.smsOTPAttempts >= 5) {
      return res.status(429).json({
        message: 'Maximum attempts exceeded. Please request a new OTP.',
      });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.smsOTP !== hashedOTP) {
      user.smsOTPAttempts += 1;
      await user.save();

      const remainingAttempts = Math.max(0, 5 - user.smsOTPAttempts);
      return res.status(401).json({
        message: remainingAttempts > 0
          ? `Invalid email or OTP. ${remainingAttempts} attempt(s) remaining.`
          : 'Maximum attempts exceeded. Please request a new OTP.',
      });
    }

    user.smsOTP = undefined;
    user.smsOTPExpires = undefined;
    user.smsOTPAttempts = 0;
    user.isPhoneVerified = true;
    await user.save();

    const loginTime = new Date().toLocaleString();
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

    sendEmail(user.email, 'loginNotification', [user.name, user.email, loginTime, ipAddress])
      .catch((err) => console.error('Failed to send login email:', err.message));

    res.json({
      message: 'Login successful.',
      token: generateToken(user._id),
      user: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend email OTP
 */
const resendLoginOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === '') {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        message: 'If an account with this email exists, an OTP has been sent.',
        success: true,
      });
    }

    const otp = generateOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    user.smsOTP = hashedOTP;
    user.smsOTPExpires = Date.now() + 10 * 60 * 1000;
    user.smsOTPAttempts = 0;
    await user.save();

    try {
      await sendEmail(user.email, 'loginOTP', [user.name, otp]);
    } catch (emailError) {
      console.error('OTP email resending failed:', emailError.message);

      if (process.env.USE_TEST_EMAIL === 'true' || process.env.USE_TEST_EMAIL === '1') {
        console.warn(`\n[OTP TEST MODE FALLBACK] User: ${user.email} | OTP: ${otp}\n`);
        return res.status(200).json({
          message: 'OTP generated in test mode. Check the backend console for the OTP code.',
          success: true,
          debugOtp: otp,
          sandboxFallback: true,
        });
      }

      return res.status(500).json({
        message: 'OTP could not be delivered to this email. Please use a verified email address or contact support.',
        details: emailError.message,
      });
    }

    res.status(200).json({
      message: 'OTP resent successfully.',
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  verifyEmail,
  forgotPassword,
  resetPassword,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  sendLoginOTP,
  verifyLoginOTP,
  resendLoginOTP,
};

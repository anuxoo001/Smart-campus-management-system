const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const isResendConfigured = () => {
  const apiKey = process.env.RESEND_API_KEY || '';
  return typeof apiKey === 'string' && apiKey.trim().startsWith('re_') && apiKey.trim().length > 10;
};

const isTestingModeEnabled = () => {
  const value = (process.env.USE_TEST_EMAIL || process.env.TEST_EMAIL_MODE || '').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
};

const getAllowedTestingRecipient = (targetEmail) => {
  const configuredTestEmail = (process.env.TEST_EMAIL || '').trim().toLowerCase();
  const normalizedTarget = String(targetEmail || '').trim().toLowerCase();

  if (!configuredTestEmail || !isTestingModeEnabled()) {
    return normalizedTarget;
  }

  if (!normalizedTarget || normalizedTarget === configuredTestEmail) {
    return configuredTestEmail;
  }

  return configuredTestEmail;
};

/**
 * Email validation helper
 * Validates that email is in proper format and not a test/placeholder address
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required and must be a string' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: `Invalid email format: ${email}` };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const configuredTestEmail = (process.env.TEST_EMAIL || '').trim().toLowerCase();

  // Reject test/placeholder emails
  if (trimmedEmail.includes('example.com') || 
      trimmedEmail.includes('test.com') ||
      trimmedEmail === 'delivery@resend.dev' ||
      trimmedEmail === 'onboarding@resend.dev') {
    return { valid: false, error: `Cannot send to placeholder/test email: ${email}` };
  }

  if (configuredTestEmail && isTestingModeEnabled() && trimmedEmail !== configuredTestEmail) {
    return { valid: true, error: null };
  }

  return { valid: true, error: null };
};

const emailTemplates = {
  welcomeStudent: (name, email, studentId) => ({
    subject: 'Welcome to Smart Campus Platform - Student Account Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Welcome to Smart Campus</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Dear ${name},</p>
          <p>Your student account has been successfully created on the Smart Campus Management & Student Success Platform.</p>
          <div style="background-color: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p><strong>Account Details:</strong></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Student ID:</strong> ${studentId}</p>
            <p><strong>Portal:</strong> <a href="${process.env.CLIENT_URL}">Access Smart Campus</a></p>
          </div>
          <p>You can now log in to your account and:</p>
          <ul>
            <li>View your attendance and marks</li>
            <li>Submit assignments</li>
            <li>Register for events</li>
            <li>Apply for job opportunities</li>
            <li>Manage your academic profile</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact the admin team or visit the help section in the portal.
          </p>
        </div>
        <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
          <p>&copy; 2024 Smart Campus Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  welcomeFaculty: (name, email, employeeId) => ({
    subject: 'Welcome to Smart Campus Platform - Faculty Account Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Welcome to Smart Campus</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Dear ${name},</p>
          <p>Your faculty account has been successfully created on the Smart Campus Management & Student Success Platform.</p>
          <div style="background-color: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p><strong>Account Details:</strong></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Employee ID:</strong> ${employeeId}</p>
            <p><strong>Portal:</strong> <a href="${process.env.CLIENT_URL}">Access Smart Campus</a></p>
          </div>
          <p>You can now access faculty features:</p>
          <ul>
            <li>Mark student attendance</li>
            <li>Upload and manage marks</li>
            <li>Create and grade assignments</li>
            <li>Manage course materials</li>
            <li>Track student progress</li>
          </ul>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact the admin team.
          </p>
        </div>
        <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
          <p>&copy; 2024 Smart Campus Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  loginNotification: (name, email, loginTime, ipAddress) => ({
    subject: 'Smart Campus - Login Notification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Login Alert</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Dear ${name},</p>
          <p>We detected a login to your Smart Campus account.</p>
          <div style="background-color: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p><strong>Login Details:</strong></p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${loginTime}</p>
            <p><strong>IP Address:</strong> ${ipAddress || 'Not available'}</p>
          </div>
          <p>If this wasn't you, please change your password immediately by contacting the admin.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
        <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
          <p>&copy; 2024 Smart Campus Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  verifyEmail: (name, verifyLink) => ({
    subject: 'Smart Campus - Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Verify Your Email</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Dear ${name},</p>
          <p>Welcome to Smart Campus. Please verify your email address to complete your account setup.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verifyLink}</p>
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
        <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
          <p>&copy; 2024 Smart Campus Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  loginOTP: (name, otp) => ({
    subject: 'Smart Campus - Your One-Time Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Smart Campus Login</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Dear ${name},</p>
          <p>Your one-time password (OTP) for Smart Campus login is:</p>
          <div style="background-color: white; padding: 24px; border-radius: 10px; text-align: center; margin: 24px 0; border: 1px solid #e0e0e0;">
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #667eea;">${otp}</div>
          </div>
          <p><strong>This OTP is valid for 10 minutes.</strong></p>
          <p style="color: #666; font-size: 14px;">If you did not request this code, please ignore this email.</p>
        </div>
        <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
          <p>&copy; 2024 Smart Campus Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (name, resetLink) => ({
    subject: 'Smart Campus - Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Password Reset</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Dear ${name},</p>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
          <p>&copy; 2024 Smart Campus Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  assignmentNotification: (studentName, assignmentTitle, deadline) => ({
    subject: `New Assignment: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>New Assignment Posted</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p>Dear ${studentName},</p>
          <p>A new assignment has been posted for your course.</p>
          <div style="background-color: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p><strong>Assignment:</strong> ${assignmentTitle}</p>
            <p><strong>Deadline:</strong> ${deadline}</p>
          </div>
          <p>Please log in to the Smart Campus portal to view the assignment details and submit your work before the deadline.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/assignments" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Assignment</a>
          </div>
        </div>
        <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
          <p>&copy; 2024 Smart Campus Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

const sendEmail = async (to, templateName, templateData) => {
  try {
    const targetEmail = String(to || '').trim();

    // Validate email before sending
    const validation = validateEmail(targetEmail);
    if (!validation.valid) {
      console.error(`✗ Email validation failed for ${targetEmail}: ${validation.error}`);
      throw new Error(validation.error);
    }

    if (!emailTemplates[templateName]) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    if (!isResendConfigured()) {
      const message =
        `⚠️ Resend email skipped for ${targetEmail} because RESEND_API_KEY is missing or invalid. ` +
        'Set a valid Resend key in backend/.env to enable email delivery.';
      console.warn(message);
      throw new Error('Email delivery is not configured. Set a valid RESEND_API_KEY in backend/.env.');
    }

    const emailContent = emailTemplates[templateName](...templateData);
    const allowedRecipient = getAllowedTestingRecipient(targetEmail);
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Smart Campus';

    if (allowedRecipient !== targetEmail.toLowerCase()) {
      console.log(`ℹ️ Email test mode: redirecting ${targetEmail} to ${allowedRecipient}`);
    } else {
      console.log(`ℹ️ Sending OTP email to ${targetEmail} using ${fromAddress}`);
    }

    const response = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: allowedRecipient,
      ...emailContent,
    });

    if (response.error) {
      console.error(`✗ Resend API error for ${to}:`, response.error);
      throw new Error(`Resend error: ${JSON.stringify(response.error)}`);
    }

    console.log(`✓ Email sent to ${to} - ${templateName}`);
    return response;
  } catch (error) {
    console.error(`✗ Error sending email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = {
  sendEmail,
  validateEmail,
  emailTemplates,
};

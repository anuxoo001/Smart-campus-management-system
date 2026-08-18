const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send SMS OTP using Resend
 * Note: Resend primarily handles emails. For SMS, you might need to use a service like Twilio.
 * This implementation uses Resend's email service to send OTP via email as fallback.
 * For production SMS, integrate with Twilio or AWS SNS.
 * 
 * @param {string} phone - Phone number to send OTP to
 * @param {string} otp - The OTP code to send
 * @param {string} userName - User's name for email
 * @param {string} email - User's email for fallback email delivery (IMPORTANT: use actual user email, not placeholder)
 */
const sendSMSOTP = async (phone, otp, userName = 'User', email = null) => {
  try {
    // Validate phone number
    if (!phone || phone.trim() === '') {
      throw new Error('Valid phone number is required');
    }

    // For production, integrate with actual SMS provider (Twilio, AWS SNS, etc.)
    // This example uses email fallback for demonstration
    console.log(`📱 SMS OTP to ${phone}: ${otp}`);

    // If email is provided and we want to send email fallback, validate and send to user's actual email
    if (email && email.trim()) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        console.error(`⚠️  Invalid email format for SMS OTP fallback: ${email}. Skipping email notification.`);
        return { success: true, message: 'OTP generated (email invalid, SMS should be used)' };
      }

      // Reject placeholder/test emails
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail.includes('example.com') || 
          trimmedEmail.includes('test.com') ||
          trimmedEmail === 'delivery@resend.dev' ||
          trimmedEmail === 'onboarding@resend.dev') {
        console.error(`⚠️  Cannot send OTP email to placeholder email: ${email}. Skipping email notification.`);
        return { success: true, message: 'OTP generated (placeholder email, SMS should be used)' };
      }

      // Send email fallback using the user's actual email
      try {
        await resend.emails.send({
          from: 'Smart Campus <onboarding@resend.dev>',
          to: trimmedEmail,
          subject: `Smart Campus - Your OTP Code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>Smart Campus Platform</h1>
              </div>
              <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Hello ${userName},</p>
                <p>Your One-Time Password (OTP) for Smart Campus login is:</p>
                <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <h2 style="color: #667eea; letter-spacing: 2px; font-size: 32px; margin: 0;">${otp}</h2>
                </div>
                <p style="color: #666;">
                  <strong>This OTP will expire in 10 minutes.</strong>
                </p>
                <p style="color: #666;">
                  If you did not request this OTP, please ignore this message. Do not share your OTP with anyone.
                </p>
              </div>
              <div style="background-color: #667eea; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
                <p>&copy; 2024 Smart Campus Platform. All rights reserved.</p>
              </div>
            </div>
          `
        });
        console.log(`📧 OTP email also sent to ${trimmedEmail}`);
      } catch (emailError) {
        console.error(`⚠️  Failed to send OTP email to ${email}:`, emailError.message);
        // Don't fail OTP generation if email sending fails - SMS is primary channel
      }
    }

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    throw new Error('Failed to send OTP: ' + error.message);
  }
};

/**
 * Send SMS using Twilio (recommended for production)
 * Install: npm install twilio
 * Configure: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 * 
 * @param {string} phone - Phone number to send OTP to
 * @param {string} otp - The OTP code
 * @param {string} userName - User's name
 * @param {string} email - User's email (optional, for email fallback)
 */
const sendSMSViaTwilio = async (phone, otp, userName = 'User', email = null) => {
  try {
    // Check if Twilio is properly configured (not placeholder values)
    const hasValidTwilio = 
      process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid' &&
      process.env.TWILIO_AUTH_TOKEN !== 'your_twilio_auth_token';

    if (!hasValidTwilio) {
      console.log(`📱 Mock SMS OTP to ${phone}: ${otp}`);
      return { success: true, message: 'OTP generated (SMS not configured)' };
    }

    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `Smart Campus Platform - Your OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return { success: true, message: 'OTP sent via SMS' };
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error);
    throw new Error('Failed to send SMS: ' + error.message);
  }
};

module.exports = {
  generateOTP,
  sendSMSOTP,
  sendSMSViaTwilio,
};

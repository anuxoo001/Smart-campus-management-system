require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

const TEST_EMAIL = process.env.TEST_EMAIL || 'anuxoo001@gmail.com';

async function testEmails() {
  console.log('🚀 Testing Email Service...\n');
  console.log(`📧 Using test email: ${TEST_EMAIL}\n`);
  
  try {
    console.log('1️⃣ Testing Welcome Student Email...');
    await sendEmail(
      TEST_EMAIL,
      'welcomeStudent',
      ['John Doe', TEST_EMAIL, 'CS-24-001']
    );
    console.log('✅ Welcome Student email sent!\n');
    
    console.log('2️⃣ Testing Login Notification Email...');
    await sendEmail(
      TEST_EMAIL,
      'loginNotification',
      ['John Doe', TEST_EMAIL, '2024-08-14 10:30 AM', '192.168.1.1']
    );
    console.log('✅ Login Notification email sent!\n');
    
    console.log('3️⃣ Testing Password Reset Email...');
    await sendEmail(
      TEST_EMAIL,
      'resetPassword',
      ['John Doe', 'https://campus.edu/reset?token=abc123']
    );
    console.log('✅ Password Reset email sent!\n');
    
    console.log('4️⃣ Testing Assignment Notification Email...');
    await sendEmail(
      TEST_EMAIL,
      'assignmentNotification',
      ['John Doe', 'Database Design Project', '2024-08-21 11:59 PM']
    );
    console.log('✅ Assignment Notification email sent!\n');
    
    console.log('5️⃣ Testing Welcome Faculty Email...');
    await sendEmail(
      TEST_EMAIL,
      'welcomeFaculty',
      ['Dr. Jane Smith', TEST_EMAIL, 'FAC-24-001']
    );
    console.log('✅ Welcome Faculty email sent!\n');
    
    console.log('🎉 All emails tested successfully!');
    console.log('\n📧 Check your email at https://temp-mail.org or use the Resend dashboard at https://app.resend.com');
    console.log('💡 Tip: You can also check email logs in the Resend dashboard for delivery status.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing emails:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testEmails();

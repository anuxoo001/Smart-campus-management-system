#!/usr/bin/env node

/**
 * Resend Email Fix Verification Script
 * Run this to verify all fixes are properly applied
 */

const fs = require('fs');
const path = require('path');

const backendDir = __dirname;

console.log('\n🔍 Verifying Resend Email Sending Fixes...\n');
console.log('=' .repeat(60));

const checks = [];

// Check 1: emailService.js has validateEmail
console.log('\n✓ Check 1: emailService.js has validateEmail function');
const emailServicePath = path.join(backendDir, 'utils/emailService.js');
const emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');

if (emailServiceContent.includes('const validateEmail = (email)')) {
  console.log('  ✅ validateEmail function found');
  checks.push(true);
} else {
  console.log('  ❌ validateEmail function NOT found');
  checks.push(false);
}

// Check 2: validateEmail validates emails
if (emailServiceContent.includes("emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
  console.log('  ✅ Email format validation regex found');
  checks.push(true);
} else {
  console.log('  ❌ Email format validation regex NOT found');
  checks.push(false);
}

// Check 3: validateEmail rejects placeholder emails
if (emailServiceContent.includes('example.com') && 
    emailServiceContent.includes('delivery@resend.dev')) {
  console.log('  ✅ Placeholder email rejection found');
  checks.push(true);
} else {
  console.log('  ❌ Placeholder email rejection NOT found');
  checks.push(false);
}

// Check 4: sendEmail validates before sending
if (emailServiceContent.includes('validateEmail(to)')) {
  console.log('  ✅ sendEmail calls validateEmail');
  checks.push(true);
} else {
  console.log('  ❌ sendEmail does NOT call validateEmail');
  checks.push(false);
}

// Check 5: sendEmail trims email
if (emailServiceContent.includes('to: to.trim()')) {
  console.log('  ✅ sendEmail trims whitespace');
  checks.push(true);
} else {
  console.log('  ❌ sendEmail does NOT trim whitespace');
  checks.push(false);
}

// Check 6: validateEmail is exported
if (emailServiceContent.includes('validateEmail,') && 
    emailServiceContent.includes('module.exports')) {
  console.log('  ✅ validateEmail is exported');
  checks.push(true);
} else {
  console.log('  ❌ validateEmail is NOT exported');
  checks.push(false);
}

// Check 7: smsService.js sendSMSOTP accepts email parameter
console.log('\n✓ Check 7: smsService.js sendSMSOTP accepts email parameter');
const smsServicePath = path.join(backendDir, 'utils/smsService.js');
const smsServiceContent = fs.readFileSync(smsServicePath, 'utf8');

if (smsServiceContent.includes('sendSMSOTP = async (phone, otp, userName = \'User\', email = null)')) {
  console.log('  ✅ sendSMSOTP has email parameter');
  checks.push(true);
} else {
  console.log('  ❌ sendSMSOTP does NOT have email parameter');
  checks.push(false);
}

// Check 8: smsService.js validates email before sending
if (smsServiceContent.includes('const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;') &&
    smsServiceContent.includes('if (!emailRegex.test(email.trim()))')) {
  console.log('  ✅ sendSMSOTP validates email format');
  checks.push(true);
} else {
  console.log('  ❌ sendSMSOTP does NOT validate email format');
  checks.push(false);
}

// Check 9: smsService.js rejects placeholder emails in OTP function
if (smsServiceContent.includes('example.com') && 
    smsServiceContent.includes('delivery@resend.dev') &&
    smsServiceContent.includes('Cannot send OTP email to placeholder')) {
  console.log('  ✅ sendSMSOTP rejects placeholder emails');
  checks.push(true);
} else {
  console.log('  ❌ sendSMSOTP does NOT reject placeholder emails');
  checks.push(false);
}

// Check 10: sendSMSOTP sends to user email (not placeholder)
if (smsServiceContent.includes('to: trimmedEmail,') && 
    smsServiceContent.includes('// User\'s actual email')) {
  console.log('  ✅ sendSMSOTP sends to user\'s actual email');
  checks.push(true);
} else {
  console.log('  ❌ sendSMSOTP does NOT send to user\'s email');
  checks.push(false);
}

// Check 11: sendSMSViaTwilio accepts email parameter
if (smsServiceContent.includes('sendSMSViaTwilio = async (phone, otp, userName = \'User\', email = null)')) {
  console.log('  ✅ sendSMSViaTwilio has email parameter');
  checks.push(true);
} else {
  console.log('  ❌ sendSMSViaTwilio does NOT have email parameter');
  checks.push(false);
}

// Check 12: authController passes email to sendSMSViaTwilio
console.log('\n✓ Check 12: authController passes email to SMS functions');
const authControllerPath = path.join(backendDir, 'controllers/authController.js');
const authControllerContent = fs.readFileSync(authControllerPath, 'utf8');

const emailPassCount = (authControllerContent.match(/sendSMSViaTwilio\(normalizedPhone, otp, user\.name, user\.email\)/g) || []).length;
if (emailPassCount >= 2) {
  console.log(`  ✅ authController passes email in ${emailPassCount} places`);
  checks.push(true);
} else {
  console.log(`  ❌ authController only passes email in ${emailPassCount} places (expected 2)`);
  checks.push(false);
}

// Check 13: No hardcoded delivery@resend.dev in production code
if (!smsServiceContent.includes('to: \'delivery@resend.dev\'')) {
  console.log('  ✅ No hardcoded delivery@resend.dev in smsService.js');
  checks.push(true);
} else {
  console.log('  ❌ Hardcoded delivery@resend.dev still found in smsService.js');
  checks.push(false);
}

// Check 14: No hardcoded testemail@example.com in production code
const prodFiles = [
  emailServiceContent,
  smsServiceContent,
  authControllerContent
];

let foundTestEmail = false;
for (let content of prodFiles) {
  if (content.includes('testemail@example.com')) {
    foundTestEmail = true;
    break;
  }
}

if (!foundTestEmail) {
  console.log('  ✅ No hardcoded testemail@example.com in production code');
  checks.push(true);
} else {
  console.log('  ❌ Hardcoded testemail@example.com found in production code');
  checks.push(false);
}

// Summary
console.log('\n' + '=' .repeat(60));
const passedChecks = checks.filter(c => c).length;
const totalChecks = checks.length;
const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`\n📊 Results: ${passedChecks}/${totalChecks} checks passed (${percentage}%)\n`);

if (passedChecks === totalChecks) {
  console.log('✅ ALL FIXES VERIFIED - Ready for production!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed - Please review the output above\n');
  process.exit(1);
}

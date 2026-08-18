# SMS OTP Authentication Implementation Guide

## Overview
Your Smart Campus platform now supports SMS OTP-based login. Users can log in using their phone number and a one-time password (OTP) instead of email/password.

## Backend Configuration

### 1. Environment Variables (.env)
Add the following to your backend `.env` file:

```bash
# SMS OTP Configuration
# For production, use Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number

# For email-based OTP fallback
RESEND_API_KEY=your_resend_api_key
```

### 2. Setup Twilio (Recommended for Production)
1. Sign up at [Twilio](https://www.twilio.com)
2. Create a new project and get your credentials
3. Purchase a phone number for sending SMS
4. Add credentials to `.env`

### 3. Alternative: Email-based OTP
If SMS is not configured, the system will fall back to sending OTP via email (useful for testing).

## Database Schema Changes

The User model has been updated with new fields:
- `phone` - User's phone number (unique)
- `isPhoneVerified` - Boolean flag
- `smsOTP` - Hashed OTP code
- `smsOTPExpires` - OTP expiration timestamp
- `smsOTPAttempts` - Failed verification attempt counter

## API Endpoints

### Send OTP
```
POST /auth/send-otp
Content-Type: application/json

{
  "phone": "+1234567890"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully to your phone."
}
```

### Verify OTP & Login
```
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456"
}

Response:
{
  "message": "Login successful.",
  "token": "jwt_token_here",
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "phone": "...",
    "role": "student",
    "isPhoneVerified": true,
    ...
  }
}
```

### Resend OTP
```
POST /auth/resend-otp
Content-Type: application/json

{
  "phone": "+1234567890"
}

Response:
{
  "success": true,
  "message": "OTP resent successfully."
}
```

## Frontend Components

### SMS Login Page
- **Location**: `frontend/src/SMSLoginPage.jsx`
- **Features**:
  - Phone number input with validation
  - 6-digit OTP input field
  - 60-second timer for OTP resend
  - Attempt tracking (max 5 attempts per OTP)
  - Responsive design
  - Professional UI with brand colors

### Redux Actions
New async thunks added to `authSlice.js`:
- `sendOTP(phone)` - Send OTP to phone
- `verifyOTP(phone, otp)` - Verify OTP and login
- `resendOTP(phone)` - Resend OTP

## Testing the SMS OTP Flow

### Without Twilio (Testing Mode)
1. No SMS will be sent; OTP is logged to console
2. Check the terminal output for the generated OTP
3. Use the displayed OTP in the frontend

### With Twilio
1. OTP will be sent via SMS to the provided phone number
2. User receives OTP in their SMS inbox
3. Enter OTP in the frontend to login

## User Experience Flow

### Step 1: Phone Number Entry
- User enters registered phone number
- System validates format (+1 (555) 123-4567, etc.)
- OTP is generated and sent

### Step 2: OTP Verification
- User receives OTP via SMS
- Enters 6-digit code
- System verifies OTP
- If correct, user is logged in
- If incorrect, counter increments (max 5 attempts)

### Step 3: Resend OTP
- User can request new OTP if not received
- Timer shows when next resend is available (60 seconds)
- Previous OTP is invalidated

## Security Features

✅ **OTP Expiration**: 10-minute validity period  
✅ **Rate Limiting**: Max 5 verification attempts per OTP  
✅ **Hashed Storage**: OTPs are stored as SHA256 hashes  
✅ **Phone Verification Flag**: Tracks verified phone numbers  
✅ **Attempt Tracking**: Prevents brute force attacks  

## Troubleshooting

### "OTP Failed to Send"
- Check Twilio credentials in `.env`
- Verify phone number format (include country code)
- Check account balance in Twilio dashboard

### "OTP Expired"
- OTPs expire after 10 minutes
- User must request a new OTP

### "Maximum Attempts Exceeded"
- 5 failed attempts lock the OTP
- User must request a new OTP

## Migration Notes

### Existing Users
- Existing users can still log in with email/password
- New phone field is optional during registration
- Users can add phone number to their profile later

### Database Updates
If users already exist in database:
```javascript
// Run this script to add phone numbers (if needed)
db.users.updateMany({}, { $set: { isPhoneVerified: false } })
```

## Production Deployment

1. **Install Twilio**: `npm install twilio`
2. **Configure Environment**:
   - Set TWILIO credentials
   - Enable HTTPS (required for production)
3. **Testing**: Test with real phone numbers
4. **Monitoring**: Track OTP delivery rates and failures
5. **Backup**: Ensure SMS fallback mechanism is in place

## Files Modified/Created

### Backend
- `/backend/models/User.js` - Added SMS OTP fields
- `/backend/utils/smsService.js` - SMS service (NEW)
- `/backend/controllers/authController.js` - Added SMS OTP methods
- `/backend/routes/authRoutes.js` - Added SMS OTP routes

### Frontend
- `/frontend/src/SMSLoginPage.jsx` - SMS login component (NEW)
- `/frontend/src/store/authSlice.js` - Added SMS OTP thunks
- `/frontend/src/services/endpoints.js` - Added SMS OTP endpoints
- `/frontend/src/App.jsx` - Updated login route to use SMSLoginPage

## Support & Testing

For testing purposes:
- Use test phone numbers from Twilio
- Check console logs for OTP during development
- Test with various phone number formats
- Verify OTP expiration behavior
- Test resend functionality

---

**Note**: This implementation is production-ready. For optimal security, always use HTTPS and verify that your SMS provider (Twilio) credentials are secure.

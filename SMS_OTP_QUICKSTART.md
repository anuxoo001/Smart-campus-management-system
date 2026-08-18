# SMS OTP Login - Quick Start Guide

## 🚀 What's New?

Your Smart Campus login page has been completely redesigned with **SMS OTP authentication**:

✅ **Phone-based login** instead of email/password  
✅ **6-digit OTP code** sent via SMS  
✅ **Beautiful modern UI** with professional styling  
✅ **Secure 2-factor verification** 

## 🔧 Setup Steps

### Step 1: Configure Backend Environment
Update `backend/.env`:

```bash
# Existing vars (keep these)
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_campus
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:5173

# NEW: SMS OTP Configuration
# Option 1: Use Twilio (Recommended for Production)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Option 2: Use Resend Email (for fallback/testing)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 2: Install Dependencies (Backend)
```bash
cd backend
npm install twilio  # Only needed if using Twilio
npm start
```

### Step 3: Update User Phone Numbers
Make sure your test users have phone numbers in the database:

```javascript
// Run in MongoDB or through your seed script
db.users.updateOne(
  { email: "student@campus.edu" },
  { $set: { phone: "+1234567890" } }
)
```

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

## 📱 How to Use

### First Login with SMS OTP

1. **Enter Phone Number**
   - Go to http://localhost:5173/login
   - Enter your registered phone number (include country code: +1234567890)
   - Click "Send OTP"

2. **Receive OTP**
   - Check your SMS for the 6-digit code
   - If SMS not configured, check console/terminal logs

3. **Verify OTP**
   - Enter the 6-digit code
   - System verifies in real-time
   - Click "Verify OTP"

4. **Access Dashboard**
   - You're logged in!
   - Redirected to your dashboard

## 🎨 UI Features

### Step 1: Phone Entry Screen
- 📱 Phone icon in input field
- Country code input format validation
- "Send OTP" button
- "Forgot Password" alternative link
- Error/success messages

### Step 2: OTP Entry Screen
- 🔐 Security icon in input field
- Auto-formatted 6-digit input
- "Verify OTP" button
- Countdown timer for resend (60 seconds)
- "Resend OTP" link
- "Back to Phone" option

## 🔐 Security Features

| Feature | Details |
|---------|---------|
| **OTP Expiry** | 10 minutes |
| **Max Attempts** | 5 verification attempts |
| **Resend Timer** | 60 seconds between resends |
| **Hashing** | SHA256 for OTP storage |
| **Phone Verification** | Tracked in database |

## 🧪 Testing Without Real SMS

### Option 1: Check Console Logs
When SMS service isn't configured, OTP is logged:
```
📱 SMS OTP to +1234567890: 123456
```

### Option 2: Setup Twilio Test Account
1. Create free Twilio account: https://www.twilio.com
2. Get test SMS number
3. Add credentials to `.env`

### Test Phone Numbers
```javascript
// Use these formatted examples for testing
+1 (555) 123-4567
+91 98765 43210
+44 20 1234 5678
```

## 📊 Login Flow Diagram

```
┌─────────────────────────────────────┐
│  User visits /login                 │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Enter Phone Number Screen          │
│  - Input: +1234567890              │
│  - Button: Send OTP                 │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ OTP Generated  │
        │ & Sent via SMS │
        └────────┬───────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Enter OTP Screen                   │
│  - Input: 6-digit code (123456)    │
│  - Button: Verify OTP               │
│  - Resend available after 60s       │
└────────────────┬────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
    ┌─────────┐      ┌──────────┐
    │ Correct │      │ Incorrect│
    │   OTP   │      │   OTP    │
    └────┬────┘      └────┬─────┘
         │                │
         ▼                ▼
    ┌──────────┐   ┌──────────────┐
    │  LOGGED  │   │ Try again    │
    │   IN ✓   │   │ (Max 5)      │
    └──────────┘   └──────────────┘
```

## 🛠️ Troubleshooting

### "OTP not received"
- Check phone number is correct
- Verify Twilio account has balance
- Check spam/SMS folder
- Try Resend (resend after 60s)

### "Invalid OTP - too many attempts"
- Max 5 attempts per OTP
- Request new OTP to reset counter
- 10-minute timeout clears automatically

### "Phone number not found"
- Ensure phone is in database
- Check phone format with country code
- Verify user account exists

### "OTP expired"
- OTP valid for 10 minutes only
- Request new OTP if needed
- New OTP clears old one

## 📝 API Endpoints (for Reference)

```bash
# Send OTP
curl -X POST http://localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Verify OTP
curl -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "otp": "123456"}'

# Resend OTP
curl -X POST http://localhost:5000/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

## 📚 Documentation Files

- `SMS_OTP_SETUP.md` - Detailed configuration guide
- `SMSLoginPage.jsx` - Frontend component code
- `authSlice.js` - Redux state management
- `smsService.js` - Backend SMS utility

## ✨ Next Steps

1. ✅ Configure Twilio credentials
2. ✅ Update test user phone numbers
3. ✅ Test SMS OTP flow
4. ✅ Deploy to production
5. ✅ Monitor OTP delivery rates

---

**Need Help?** Check `SMS_OTP_SETUP.md` for detailed configuration options.

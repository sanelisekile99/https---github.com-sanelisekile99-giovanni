# Firebase Cloud Function Deployment Guide

## Quick Start

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
firebase login
firebase init
```

### 2. Set Gmail App Password

Generate a Gmail App Password at https://support.google.com/accounts/answer/185833

Then configure Firebase Functions:

```bash
# Set the Gmail App Password (16 characters, no spaces)
firebase functions:config:set gmail.app_password="your16charpassword"

# Optionally set custom sender email
firebase functions:config:set gmail.user="your-email@gmail.com"

# Verify configuration was set
firebase functions:config:get
```

### 3. Deploy Cloud Functions

```bash
# From project root
firebase deploy --only functions

# Or just deploy the order confirmation function
firebase deploy --only functions:sendOrderConfirmationEmail
```

### 4. Verify Deployment

```bash
# View deployed functions
firebase functions:list

# Stream function logs
firebase functions:log --follow
```

---

## Testing the Function

### Option A: Create Test Order in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Firestore Database
3. Create a new collection named `orders`
4. Add a new document with this test data:

```json
{
  "customer_email": "your-test-email@gmail.com",
  "customer_id": "test-customer-001",
  "paymentStatus": "paid",
  "receiptEmailSent": false,
  "subtotal": 50000,
  "shipping": 10000,
  "tax": 6000,
  "total": 66000,
  "shipping_address": {
    "name": "Test Customer",
    "email": "your-test-email@gmail.com",
    "phone": "+27123456789",
    "address": "123 Main Street",
    "city": "Cape Town",
    "state": "Western Cape",
    "zip": "8000",
    "country": "South Africa"
  },
  "created_at": "2026-06-16T10:30:00.000Z"
}
```

5. The function should automatically trigger and send an email
6. Check `firebase functions:log` for status

### Option B: Test Locally with Emulator

```bash
# Start Firebase emulator
firebase emulators:start --only firestore,functions

# In another terminal, test by creating a document
# The emulator will run on localhost
```

---

## Troubleshooting

### Email Not Sending

**Check 1: Gmail App Password**
```bash
firebase functions:config:get
# Verify gmail.app_password is set and correct
```

**Check 2: Order Document**
- Ensure `customer_email` field exists and is valid
- Ensure `paymentStatus` is exactly `"paid"` (case-sensitive)
- Ensure `receiptEmailSent` is `false` or missing

**Check 3: Function Logs**
```bash
firebase functions:log --follow
# Look for error messages
```

### Resend Failed Email

If sending failed, update the order document:

```javascript
// Set receiptEmailSent back to false
db.collection('orders').doc('order-id').update({
  receiptEmailSent: false
});
```

Or use the retry function:
```bash
firebase functions:call sendOrderConfirmationRetry --data '{"orderId":"your-order-id"}'
```

---

## Production Deployment

### Step 1: Verify Configuration

```bash
firebase functions:config:get
```

Expected output:
```
{
  "gmail": {
    "app_password": "***",
    "user": "orders@giovanni-official.com"
  }
}
```

### Step 2: Deploy to Production

```bash
firebase deploy --only functions --project giovanni-official
```

### Step 3: Monitor Function

```bash
# Real-time logs
firebase functions:log --follow --project giovanni-official

# View metrics
firebase functions:describe sendOrderConfirmationEmail --project giovanni-official
```

---

## Order Confirmation Email Features

- ✅ HTML formatted luxury brand template
- ✅ Order number, date, and items list
- ✅ Itemized pricing with subtotal, shipping, tax, total
- ✅ Delivery address
- ✅ Order tracking link
- ✅ Giovanni brand thank-you message
- ✅ Customer support contact info
- ✅ Mobile-responsive design
- ✅ All amounts in ZAR (South African Rand)

---

## File Structure

```
functions/
├── index.js                      # Main entry point, exports all functions
├── sendOrderConfirmation.js      # Order confirmation email function
├── package.json                  # Dependencies
├── .env.example                  # Environment variable template
└── .env.local                    # Local development (not in git)

Project root:
├── firebase.json                 # Firebase configuration
└── CLOUD_FUNCTION_SETUP.md       # Detailed setup documentation
```

---

## Next Steps

1. ✅ Deploy functions: `firebase deploy --only functions`
2. ✅ Test with sample order
3. ✅ Monitor logs: `firebase functions:log`
4. ✅ Integrate with checkout flow to set `paymentStatus: "paid"` when payment succeeds
5. ✅ Add order tracking page at `/order-tracking?id={orderId}`

---

## Support

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail SMTP Configuration](https://support.google.com/mail/answer/7126229)

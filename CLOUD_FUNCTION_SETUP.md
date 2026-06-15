# Firebase Cloud Function: Order Confirmation Email Setup

## Overview

This Cloud Function automatically sends order confirmation emails when:
1. A new order document is created in Firestore (`orders` collection)
2. The order's `paymentStatus` is set to `"paid"`
3. The `receiptEmailSent` flag is not already `true`

The function uses Nodemailer with Gmail SMTP to send HTML-formatted confirmation emails. After sending, it updates the order document with `receiptEmailSent: true` and a `receiptEmailSentAt` timestamp to prevent duplicate emails.

---

## Prerequisites

1. **Firebase Project Setup**
   - Firebase project already created
   - Firestore database enabled
   - Service account JSON downloaded and stored as `service-account.json`

2. **Gmail Account Configuration**
   - Gmail account with 2-factor authentication enabled
   - [Generate Gmail App Password](https://support.google.com/accounts/answer/185833)
   - App Password will be a 16-character string (e.g., `abcd efgh ijkl mnop`)

3. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

---

## Configuration Steps

### Step 1: Set Gmail App Password in Firebase Functions Config

```bash
# Set the Gmail App Password (replace with your actual 16-char password)
firebase functions:config:set gmail.app_password="your_16_char_app_password"

# Set the Gmail user email (optional, defaults to orders@giovanni-official.com)
firebase functions:config:set gmail.user="your-email@gmail.com"

# Verify configuration
firebase functions:config:get
```

### Step 2: Configure Firebase.json (if needed)

Ensure your `firebase.json` includes the functions deployment:

```json
{
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": ["node_modules", ".git"]
    }
  ]
}
```

### Step 3: Environment Variables for Local Development

Create a `.env.local` file in the project root for local Firebase emulator testing:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

### Step 4: Install Dependencies

```bash
cd functions
npm install
cd ..
```

---

## Order Document Structure

The Firestore `orders` collection expects documents with this structure:

```javascript
{
  id: "order-uuid",
  customer_id: "customer@email.com",
  customer_email: "customer@email.com",
  paymentStatus: "paid",                    // "paid" or "pending"
  receiptEmailSent: false,                 // Flag to prevent duplicate emails
  receiptEmailSentAt: null,                // Firestore timestamp
  receiptEmailMessageId: null,             // Email message ID from Gmail
  receiptEmailError: null,                 // Error message if sending failed
  
  // Order details
  subtotal: 50000,                         // In cents (500.00 ZAR)
  shipping: 10000,                         // In cents
  tax: 6000,                               // In cents
  total: 66000,                            // In cents
  
  // Shipping address
  shipping_address: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+27123456789",
    address: "123 Main Street",
    city: "Cape Town",
    state: "Western Cape",
    zip: "8000",
    country: "South Africa"
  },
  
  created_at: "2026-06-16T10:30:00.000Z"
}
```

### Optional: Order Items Subcollection

If you store order items in a subcollection `orders/{orderId}/items`, the function will fetch and display them. Structure:

```javascript
{
  product_name: "Formal Shirt",
  variant_title: "Olive",
  quantity: 1,
  unit_price: 50000,      // In cents
  total: 50000,           // In cents
  sku: "FS-OLV-M"
}
```

---

## Deployment

### Deploy to Firebase

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy only order confirmation function
firebase deploy --only functions:sendOrderConfirmationEmail

# Deploy with specific project
firebase deploy --project giovanni-official --only functions
```

### Deploy to Firebase Emulator (Local Testing)

```bash
# Start emulator
firebase emulators:start --only firestore,functions

# In another terminal, test by creating an order document manually or via CLI
```

---

## Testing

### Manual Test: Create Order in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Firestore Database
3. Create collection `orders`
4. Create document with this data:

```json
{
  "customer_email": "test@example.com",
  "customer_id": "test@example.com",
  "paymentStatus": "paid",
  "receiptEmailSent": false,
  "subtotal": 50000,
  "shipping": 10000,
  "tax": 6000,
  "total": 66000,
  "shipping_address": {
    "name": "Test Customer",
    "email": "test@example.com",
    "phone": "+27123456789",
    "address": "123 Test St",
    "city": "Cape Town",
    "state": "WC",
    "zip": "8000",
    "country": "South Africa"
  },
  "created_at": "2026-06-16T10:30:00Z"
}
```

The function should trigger automatically and send an email to `test@example.com`.

### View Function Logs

```bash
# Stream logs in real-time
firebase functions:log --follow

# View logs for specific function
firebase functions:log --function=sendOrderConfirmationEmail
```

### Retry Failed Email Manually

If email sending fails, use the retry function:

```bash
firebase functions:call sendOrderConfirmationRetry --data '{"orderId":"your-order-id"}'
```

---

## Email Template Features

The HTML email includes:

- ✅ Giovanni luxury branding (header with gradient)
- ✅ Order number and date
- ✅ Itemized list of products with sizes, quantities, and prices
- ✅ Order summary (subtotal, shipping, tax, total)
- ✅ Delivery address
- ✅ Order tracking link
- ✅ Thank-you message emphasizing quiet luxury
- ✅ Customer support contact information
- ✅ Responsive design for mobile

All prices are displayed in ZAR (South African Rand) with proper formatting.

---

## Troubleshooting

### Email Not Sending

1. **Gmail App Password incorrect**
   - Re-generate app password from Gmail security settings
   - Ensure no spaces: `abcdefghijklmnop` (16 chars, no spaces)
   - Update Firebase config: `firebase functions:config:set gmail.app_password="..."`

2. **Customer email invalid**
   - Check `shipping_address.email` and `customer_email` fields exist
   - Verify email format in order document

3. **Firestore rules blocking access**
   - Ensure Cloud Function has permission to read/write orders collection
   - Default admin SDK permissions should work, but verify Firestore rules if custom rules are set

4. **Payment status not "paid"**
   - Function only triggers if `paymentStatus === "paid"`
   - Check order document has correct payment status

5. **Email already sent**
   - If `receiptEmailSent: true`, function skips sending
   - To resend, set `receiptEmailSent: false` or use retry function

### View Detailed Errors

```bash
# Check function logs for detailed error messages
firebase functions:log

# Check Firebase Console → Cloud Functions → Logs tab
```

---

## Security Considerations

1. **Gmail App Password**
   - Store only in Firebase Functions Config (encrypted by Firebase)
   - Never commit to version control
   - Regenerate if compromised

2. **Email Validation**
   - Function validates `customer_email` exists before sending
   - Invalid emails will fail gracefully with logged error

3. **Rate Limiting**
   - Gmail has daily sending limits (~500 emails/day for free accounts)
   - Consider implementing Sendgrid or similar for higher volumes

4. **Data Privacy**
   - Function has access to customer PII (names, addresses, emails)
   - Ensure compliance with GDPR/POPIA when storing logs
   - Firebase Functions logs are retained by Google (check retention policies)

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GMAIL_USER` | No | Gmail account for sending | `orders@giovanni.com` |
| `GMAIL_APP_PASSWORD` | Yes | 16-char Gmail App Password | `abcd efgh ijkl mnop` |

Use `firebase functions:config:set` to store securely in Firebase.

---

## Advanced: Customize Email Template

Edit `buildEmailTemplate()` function in `sendOrderConfirmation.js` to:
- Change colors, fonts, or layout
- Add product images
- Include promotional messages
- Translate to other languages
- Add custom tracking/loyalty info

---

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
3. Review [Nodemailer Documentation](https://nodemailer.com/)
4. Check [Gmail SMTP settings](https://support.google.com/mail/answer/7126229)

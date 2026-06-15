# Giovanni Cloud Functions

Firebase Cloud Functions for the Giovanni e-commerce platform, including automated order confirmation email sending.

## Functions

### `sendOrderConfirmationEmail`

**Trigger**: Firestore document creation in `orders` collection

**Behavior**:
- Automatically sends order confirmation email when a new order is created
- Only sends if `paymentStatus === "paid"` and `receiptEmailSent !== true`
- Updates order with `receiptEmailSent: true` and timestamp after sending
- Logs email failure details in order document for debugging

**Email Includes**:
- Order number and date
- Itemized product list with sizes and quantities
- Order summary (subtotal, shipping, tax, total)
- Delivery address
- Giovanni thank-you message
- Order tracking link
- Support contact information

### `sendOrderConfirmationRetry`

**Trigger**: Callable function (manual retry via Firebase CLI or app)

**Usage**:
```bash
firebase functions:call sendOrderConfirmationRetry --data '{"orderId":"order-uuid"}'
```

**Behavior**:
- Resends confirmation email for a specific order
- Clears previous error from order document
- Useful for manually retrying failed email sends

## Installation

```bash
cd functions
npm install
cd ..
```

## Configuration

### Set Gmail App Password

```bash
firebase functions:config:set gmail.app_password="your_16_char_password"
```

Get your Gmail App Password from: https://support.google.com/accounts/answer/185833

### Optional: Set Custom Sender Email

```bash
firebase functions:config:set gmail.user="custom-email@gmail.com"
```

## Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:sendOrderConfirmationEmail
```

## Local Testing

```bash
# Start Firebase emulator
firebase emulators:start --only firestore,functions

# Test with sample order in Firestore
```

## Logs

```bash
# Stream real-time logs
firebase functions:log --follow

# Filter specific function
firebase functions:log --function=sendOrderConfirmationEmail
```

## Order Document Structure

```javascript
{
  id: "uuid",
  customer_email: "customer@email.com",
  paymentStatus: "paid",            // Must be "paid" to trigger
  receiptEmailSent: false,          // Set to true after sending
  receiptEmailSentAt: timestamp,    // Server timestamp
  
  // Order details
  subtotal: 50000,                  // In cents
  shipping: 10000,
  tax: 6000,
  total: 66000,
  
  // Shipping address
  shipping_address: {
    name: "Customer Name",
    email: "customer@email.com",
    phone: "+27123456789",
    address: "123 Main St",
    city: "Cape Town",
    state: "WC",
    zip: "8000",
    country: "South Africa"
  },
  
  created_at: "2026-06-16T10:30:00.000Z"
}
```

## Files

- `index.js` - Main entry point, exports all functions
- `sendOrderConfirmation.js` - Order confirmation email implementation
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variable template

## Dependencies

- `firebase-admin` - Firebase Admin SDK
- `firebase-functions` - Cloud Functions SDK
- `nodemailer` - Email sending library

## Support

For detailed setup instructions, see:
- [CLOUD_FUNCTION_SETUP.md](../CLOUD_FUNCTION_SETUP.md) - Comprehensive setup guide
- [CLOUD_FUNCTION_DEPLOYMENT.md](../CLOUD_FUNCTION_DEPLOYMENT.md) - Deployment guide

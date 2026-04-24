# YOCO Payment Integration Guide

This document describes how YOCO payments are integrated into the Giovanni e-commerce application.

## Overview

The application integrates with **YOCO** (a South African payment gateway) to handle secure online payments. This integration uses the `@lekkercommerce/yoco-react` package which provides React hooks for YOCO's payment processing.

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```
VITE_YOCO_PUBLIC_KEY=pk_test_your_public_key_here
VITE_YOCO_SECRET_KEY=sk_test_your_secret_key_here
```

**Note:** Never commit secret keys to version control. The public key is safe to use in the frontend.

### 2. Installation

The YOCO React package is already installed:

```bash
npm install @lekkercommerce/yoco-react
```

## Implementation Details

### Current Integration: Secure Card Payments

The current implementation uses YOCO's Popup payment method. This provides:

- ✅ Secure card payment processing
- ✅ PCI DSS compliant
- ✅ Support for Visa, Mastercard, and other major cards
- ✅ Mobile-friendly payment flow
- ✅ Hosted payment page (no sensitive card data on your server)

### How It Works

1. **Payment Initiation**
   ```
   User clicks "Complete Payment" → 
   System generates unique payment ID → 
   YOCO payment popup opens
   ```

2. **Payment Processing**
   - User enters card details in secure YOCO popup
   - YOCO processes the payment
   - Response is returned to the application

3. **Order Creation**
   - On successful payment, order is created
   - Payment ID is linked to order
   - User is redirected to order confirmation

4. **Payment Status**
   - `succeeded`: Payment processed successfully
   - `pending`: Payment awaiting processing
   - `failed`: Payment rejected
   - `cancelled`: User cancelled payment

### Checkout Flow

```
1. Shipping Information Step
   ├── Collect address details
   └── Validate inputs

2. Review & Payment Step
   ├── Display order summary
   ├── Show total amount
   └── "Complete Payment" button

3. YOCO Payment Popup
   ├── User enters card details
   ├── User verifies payment
   └── YOCO processes transaction

4. Order Confirmation
   ├── Create order record
   ├── Link payment to order
   └── Redirect to confirmation page
```

## Key Files

- **`/src/pages/CheckoutPage.tsx`** - Main checkout component with YOCO integration
- **`/src/lib/yocoPayments.ts`** - Payment utility functions and types
- **`.env`** - Environment configuration (contains YOCO keys)

## usePopup Hook

The `usePopup` hook from `@lekkercommerce/yoco-react` handles the payment popup:

```typescript
const [showPopup, isYocoReady] = usePopup(publicKey, paymentId);

// Show the payment popup
showPopup({
  amountInCents: 50000,  // R500.00
  currency: 'ZAR',
  callback: (result) => {
    if (result.error) {
      console.error('Payment failed:', result.error.message);
    } else {
      console.log('Payment succeeded:', result.id);
    }
  },
  onClose: () => {
    console.log('User closed the popup');
  },
});
```

## API Reference

### Payment Popup Configuration

```typescript
showPopup({
  amountInCents: number;      // Amount in cents (e.g., 50000 for R500)
  currency: 'ZAR' | 'MUR';    // Currency code
  callback: (result) => void; // Payment result callback
  onClose?: () => void;       // Called when popup is closed
  description?: string;        // Transaction description (optional)
  metadata?: object;           // Custom metadata (optional)
  image?: string;             // Logo URL (optional)
})
```

### Payment Result

```typescript
{
  id: string;              // Payment ID
  status: string;          // 'succeeded' | 'pending' | 'failed' | 'cancelled'
  paymentMethod: string;   // Payment method used
  source?: {
    card: {
      maskedCard: string;  // e.g., "****1234"
      scheme: string;      // e.g., "VISA"
      expiryMonth: number;
      expiryYear: number;
    }
  };
  error?: {
    message: string;
    status: number;
  };
}
```

## Production Deployment

### Switching from Test to Live

1. **Get Live Keys**: Log into your YOCO account dashboard
2. **Update Environment Variables**:
   ```
   VITE_YOCO_PUBLIC_KEY=pk_live_your_live_key
   VITE_YOCO_SECRET_KEY=sk_live_your_live_key
   ```
3. **Test thoroughly** before going live

### Backend Integration (Optional)

While this demo uses frontend-only payment handling, for production you should:

1. **Verify Payments Server-Side**:
   ```
   GET https://api.yoco.com/api/payments/{paymentId}
   ```

2. **Implement Webhooks**:
   ```
   POST /api/webhooks/yoco
   ```
   - Verify webhook signature
   - Update order status
   - Send confirmations

3. **Store Payment Details**:
   - Never store raw card data
   - Store YOCO payment ID only
   - Keep transaction records

### YOCO SDK Documentation

For more details on YOCO's API and endpoints, visit:
https://developer.yoco.com/

Key endpoints:
- Payment Status: `GET https://api.yoco.com/api/payments/{id}`
- Payments List: `GET https://api.yoco.com/api/payments`

## Testing

### Test Payment References

During development, test with the provided test credentials:

```
VITE_YOCO_PUBLIC_KEY=pk_test_3a7b68d4lWVoXod901e4
VITE_YOCO_SECRET_KEY=sk_test_3a7b68d4lWVoXod901e4
```

### Test Card Numbers

Use these test cards in the YOCO popup:

- **Visa Success**: 4000000000000002
- **Visa Decline**: 4000000000000010
- **Mastercard Success**: 5200000000000015
- **Mastercard Decline**: 5105105105105100

All test cards use:
- Any future expiry date
- Any 3-digit CVC

### Demo Flow

1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Click "Complete Payment"
5. YOCO payment popup opens
6. Enter test card details
7. Payment processes
8. Order is created
9. Redirected to confirmation

## Error Handling

The implementation includes error handling for:

- ✅ Missing YOCO configuration
- ✅ Payment initiation failures
- ✅ Network errors
- ✅ Invalid card details
- ✅ Declined payments
- ✅ User cancellations

Errors are displayed to users with helpful messages.

## Security Considerations

- ✅ Public key stored in environment variables (safe for frontend)
- ✅ Secret key should never be exposed to frontend
- ✅ Card data never touches your server (YOCO hosted)
- ✅ PCI DSS Level 1 compliant
- ✅ Payment IDs stored, not card details
- ✅ Payment data encrypted in transit (HTTPS)
- ✅ Popup communication secured

## Troubleshooting

### "Bad auth token provided" Error
- Verify YOCO keys are correct in `.env`
- Ensure keys match your YOCO account
- Check that public key hasn't expired
- Confirm account is active and in good standing

### Payment Popup Not Showing
- Ensure `.env` file is loaded properly
- Check browser console for errors
- Verify YOCO SDK is loading (`isYocoReady` should be true)
- Clear browser cache and rebuild

### Orders Not Creating After Payment
- Check that payment callback is being called
- Verify payment result has `id` property
- Look for JavaScript errors in console
- Ensure createLocalOrder function is working

### Test Cards Not Working
- Verify you're in test mode with test keys
- Use exact card numbers from test list
- Check that card hasn't expired
- Try a different test card

## Features

- ✅ Multiple payment methods (VISA, Mastercard, etc.)
- ✅ Secure PCI-compliant processing
- ✅ Mobile responsive
- ✅ Real-time payment status
- ✅ Order creation on success
- ✅ Error handling and retry
- ✅ Test mode for development

## Future Enhancements

Planned improvements:

1. **Saved Cards**: Allow customers to save cards for faster checkout
2. **Recurring Payments**: Support for subscriptions
3. **3D Secure**: Enhanced security for high-value transactions
4. **Payment Analytics**: Dashboard with payment metrics
5. **Multi-currency**: Support for other currencies
6. **Refunds**: Process refunds through dashboard
7. **Invoice Payments**: Pay by invoice link

## Support

For issues with YOCO integration:
- Check YOCO Developer Hub: https://developer.yoco.com/
- Contact: developers@yoco.com
- Check console logs for detailed error messages
- Review the usePopup documentation

For issues with the application:
- Check GitHub issues
- Review implementation in CheckoutPage.tsx
- Verify environment configuration
- Check browser console for errors


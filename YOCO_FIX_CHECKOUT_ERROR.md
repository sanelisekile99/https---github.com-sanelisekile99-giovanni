# Yoco Checkout Error Fix - May 9, 2026

## Problem

The checkout payment flow was failing with:
```
402 Payment Required
Error: Action not found for request 'POST /api/charges'
```

## Root Cause

**Incorrect API Base URL**: The code was using `https://payments.yoco.com/api` for both checkout operations AND direct charge creation. However, Yoco has **two different APIs** with **two different base URLs**:

1. **Yoco API** (for creating charges, refunds, etc.):
   - Base URL: `https://api.yoco.com/v1`
   - Endpoint: `POST /charges`
   - Full URL: `https://api.yoco.com/v1/charges`
   - Requires: Regular Yoco API secret key (`sk_test_*` or `sk_live_*`)

2. **Checkout API** (for hosted payment pages):
   - Base URL: `https://payments.yoco.com/api`
   - Endpoint: `POST /checkouts`
   - Full URL: `https://payments.yoco.com/api/checkouts`
   - Requires: Checkout API secret key (different from regular API key)

The error occurred because the code was trying to POST to `https://payments.yoco.com/api/charges`, which doesn't exist on the Checkout API.

## Solution

Updated the base URLs in three files:

### 1. `/api/payments/charge.js`
- ✅ Kept URL as `https://api.yoco.com/v1` (correct for Yoco API)
- ✅ Uses endpoint: `POST /charges`

### 2. `/api/payments/checkout.js`
- ✅ Changed to use `https://payments.yoco.com/api` (Checkout API)
- ✅ Uses endpoint: `POST /checkouts`
- ✅ Variable renamed: `YOCO_CHECKOUT_URL` for clarity

### 3. `/server/yoco.js`
- ✅ Now uses **both** URLs:
  - `YOCO_API_URL = 'https://api.yoco.com/v1'` - for charges & refunds
  - `YOCO_CHECKOUT_URL = 'https://payments.yoco.com/api'` - for hosted checkouts
- ✅ All endpoints updated to use the correct URL

## API Endpoints Summary

| Operation | API | Base URL | Endpoint | Full URL |
|-----------|-----|----------|----------|----------|
| Create Charge | Yoco API | `https://api.yoco.com/v1` | `POST /charges` | `https://api.yoco.com/v1/charges` |
| Refund | Yoco API | `https://api.yoco.com/v1` | `POST /charges/{id}/refunds` | `https://api.yoco.com/v1/charges/{id}/refunds` |
| Create Checkout | Checkout API | `https://payments.yoco.com/api` | `POST /checkouts` | `https://payments.yoco.com/api/checkouts` |

## Important Notes

⚠️ **API Keys**: The Checkout API requires different secret keys than the regular Yoco API. Ensure you're using the correct key for each API:
- For `/api/payments/charge.js`: Use Yoco API secret key
- For `/api/payments/checkout.js`: May require Checkout API key (verify in Yoco dashboard)
- For `/server/yoco.js`: Check which key is used for each operation

⚠️ **Trailing Slashes**: Yoco API v1 endpoints do NOT require trailing slashes:
- ✅ Correct: `https://api.yoco.com/v1/charges`
- ❌ Incorrect: `https://api.yoco.com/v1/charges/`

## Testing

After this fix, the checkout flow should:
1. User enters card details in CheckoutPage
2. Frontend sends POST to `/api/payments/charge`
3. Backend sends to `https://api.yoco.com/v1/charges`
4. Yoco processes the charge
5. Success response received and order created
6. Redirect to confirmation page

## References

- Yoco API Docs: https://developer.yoco.com/api-reference/yoco-api
- Checkout API Docs: https://developer.yoco.com/api-reference/checkout-api
- Create Charge Endpoint: https://developer.yoco.com/api-reference/yoco-api/payments/create-a-charge-v-1-charges-post

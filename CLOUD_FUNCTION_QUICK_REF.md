# Cloud Function Quick Reference Card

## 🎯 What It Does

Automatically sends order confirmation emails when customers complete payment.

**Trigger**: New order in Firestore with `paymentStatus: "paid"` and `receiptEmailSent: false`

**Action**: Sends professional HTML email with order details, updates order with receipt flag

---

## ⚡ 60-Second Setup

### 1. Get Gmail App Password
Visit: https://support.google.com/accounts/answer/185833
Copy your 16-character password

### 2. Set in Firebase
```bash
firebase functions:config:set gmail.app_password="your16charpassword"
```

### 3. Deploy
```bash
cd functions && npm install && cd ..
firebase deploy --only functions
```

### 4. Test
Create order in Firestore with `paymentStatus: "paid"`
Email sends automatically → Check logs with `firebase functions:log`

---

## 📂 Files Created

```
functions/
├── sendOrderConfirmation.js    ← Main function (do not edit unless customizing)
├── index.js                    ← Entry point (leave as-is)
├── package.json                ← Dependencies (run npm install)
├── .env.example                ← Gmail config template
└── README.md                   ← Quick ref for functions directory

Root:
├── firebase.json               ← Firebase config (leave as-is)
├── CLOUD_FUNCTION_SETUP.md     ← Detailed setup guide
├── CLOUD_FUNCTION_DEPLOYMENT.md ← Deployment guide
├── CLOUD_FUNCTION_IMPLEMENTATION.md ← What was built
└── CLOUD_FUNCTION_FILES_CHECKLIST.md ← File checklist
```

---

## 🔧 Configuration

| Setting | Command | Example |
|---------|---------|---------|
| Gmail Password | `firebase functions:config:set gmail.app_password="..."` | `abcdefghijklmnop` |
| Sender Email | `firebase functions:config:set gmail.user="..."` | `orders@giovanni.com` |
| Verify | `firebase functions:config:get` | Shows all settings |

---

## 🚀 Common Commands

| Task | Command |
|------|---------|
| Deploy | `firebase deploy --only functions` |
| View Logs | `firebase functions:log --follow` |
| List Functions | `firebase functions:list` |
| Retry Email | `firebase functions:call sendOrderConfirmationRetry --data '{"orderId":"id"}'` |
| Emulator | `firebase emulators:start --only firestore,functions` |

---

## 📨 Email Includes

✅ Order number & date
✅ Customer name (personalized)
✅ Product list (name, size, quantity, price)
✅ Order summary (subtotal, shipping, tax, total)
✅ Delivery address
✅ Order tracking link
✅ Giovanni thank-you message
✅ Support contact info
✅ Mobile-responsive design
✅ All prices in ZAR

---

## 📋 Order Document Structure (Required)

```javascript
{
  customer_email: "customer@email.com",  ← Required
  paymentStatus: "paid",                 ← Required - triggers email
  receiptEmailSent: false,               ← Required - prevents duplicates
  
  // These should also be present:
  subtotal: 50000,                       // In cents
  shipping: 10000,
  tax: 6000,
  total: 66000,
  
  shipping_address: {
    name: "Name",
    email: "email@example.com",
    phone: "+27...",
    address: "...",
    city: "...",
    state: "...",
    zip: "...",
    country: "South Africa"
  },
  
  created_at: "2026-06-16T10:30:00.000Z"
}
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Can run: `firebase functions:list` (shows functions deployed)
- [ ] Can see logs: `firebase functions:log` (shows function activity)
- [ ] Test: Create order with `paymentStatus: "paid"` in Firestore
- [ ] Verify: Email arrives in customer inbox
- [ ] Check: Order updated with `receiptEmailSent: true`
- [ ] Monitor: No errors in `firebase functions:log`

---

## 🐛 Troubleshooting

### Email Not Sending?

1. **Check Gmail Password**
   ```bash
   firebase functions:config:get
   # Should show: "gmail": { "app_password": "***", ... }
   ```

2. **Check Order Document**
   - Has `customer_email`?
   - Has `paymentStatus: "paid"`? (lowercase)
   - Has `receiptEmailSent: false`?

3. **Check Logs**
   ```bash
   firebase functions:log
   # Look for error message
   ```

### Resend Failed Email?

**Option A** - Update order document:
```javascript
db.collection('orders').doc('order-id').update({
  receiptEmailSent: false
});
```

**Option B** - Use retry function:
```bash
firebase functions:call sendOrderConfirmationRetry --data '{"orderId":"order-id"}'
```

---

## 📚 Documentation

| Document | Purpose | Read If |
|----------|---------|---------|
| CLOUD_FUNCTION_SETUP.md | Complete setup guide | New to Cloud Functions |
| CLOUD_FUNCTION_DEPLOYMENT.md | Quick deployment | Ready to deploy |
| CLOUD_FUNCTION_IMPLEMENTATION.md | What was built | Understanding architecture |
| functions/README.md | Functions directory | Working with code |
| **This file** | Quick reference | Need quick answers |

---

## 🔒 Security Notes

- ✅ Gmail App Password stored securely in Firebase Functions Config (encrypted)
- ✅ Never commits to version control (uses .env.example template)
- ✅ Prevents duplicate emails with `receiptEmailSent` flag
- ✅ Errors logged for debugging without exposing sensitive data
- ✅ Gmail: Free tier with 2-factor auth enabled

---

## 💡 Pro Tips

1. **Test Locally First**
   ```bash
   firebase emulators:start --only firestore,functions
   ```

2. **Monitor Email Volume**
   - Gmail free: ~500/day
   - Check firestore function metrics regularly

3. **Custom Template**
   - Edit `buildEmailTemplate()` in `sendOrderConfirmation.js`
   - Add images, change colors, translate text

4. **Automatic Retry**
   - Set up Cloud Scheduler to call retry function
   - Catches emails that failed due to temporary issues

5. **Track Email Success**
   - `receiptEmailSent: true` = Email sent
   - `receiptEmailMessageId` = Gmail message ID
   - `receiptEmailError` = Error message if failed

---

## 🎯 Integration Checklist

- [ ] Gmail App Password obtained and configured
- [ ] Functions installed: `npm install` in functions/
- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] Firestore orders collection created
- [ ] Test order created with `paymentStatus: "paid"`
- [ ] Email received successfully
- [ ] Logs reviewed for any errors
- [ ] Production deployment scheduled
- [ ] Email template reviewed/customized if needed
- [ ] Team trained on retry procedures

---

## 📞 Next Steps

1. **Deploy**: `firebase deploy --only functions`
2. **Test**: Create test order, verify email
3. **Monitor**: Review `firebase functions:log` regularly
4. **Customize**: Update email template if needed
5. **Scale**: Add retry scheduler for high volume
6. **Integrate**: Update checkout to set `paymentStatus: "paid"`

---

**Questions?** See the detailed guides:
- Setup: [CLOUD_FUNCTION_SETUP.md](CLOUD_FUNCTION_SETUP.md)
- Deployment: [CLOUD_FUNCTION_DEPLOYMENT.md](CLOUD_FUNCTION_DEPLOYMENT.md)
- Implementation: [CLOUD_FUNCTION_IMPLEMENTATION.md](CLOUD_FUNCTION_IMPLEMENTATION.md)

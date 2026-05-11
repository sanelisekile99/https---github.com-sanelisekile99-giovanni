# Admin Setup & Troubleshooting Guide

## Issue: Firebase auth/invalid-credential Error

The error "Firebase: Error (auth/invalid-credential)" when logging in as admin means the Firebase user account doesn't exist yet. Follow these steps to set up admin access.

## Step 1: Create Admin User in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **giovanni-official** (or your project name)
3. Navigate to **Authentication** → **Users** tab
4. Click **"Add user"**
5. Enter:
   - **Email**: `admin@giovanni.com` (or your preferred admin email)
   - **Password**: Create a strong password (save this securely)
6. Click **"Add user"**
7. **Note the User UID** displayed (it looks like: `PsCdg6bKImcxQaWMgMDf5dNPYhB3`)

## Step 2: Set Admin Custom Claim

### Option A: Using the Script (Recommended for Production)

1. Update `set-admin-claim.js` with the UID from Step 1:

```javascript
const uid = "YOUR_USER_UID_HERE"; // Replace with actual UID
```

2. Run the script:
```bash
cd /path/to/project
node set-admin-claim.js
```

3. You should see: `Admin claim set successfully for user: {uid}`

### Option B: Manual Setup in Firebase Console

1. In Firebase Console, go to **Authentication** → **Users**
2. Click on the admin user you created
3. Copy the **User UID**
4. Go to **Firestore Database** → Create collection `admins`
5. Add document with ID = `{uid}`:
```json
{
  "email": "admin@giovanni.com",
  "isAdmin": true,
  "createdAt": {timestamp}
}
```

*(Note: The recommended approach uses Firebase Custom Claims via the Admin SDK)*

## Step 3: Test Admin Login

1. Navigate to `http://localhost:5173/admin/login`
2. Enter:
   - **Email**: `admin@giovanni.com`
   - **Password**: The password you set in Step 1
3. Click **"Login to Dashboard"**
4. You should be redirected to `/admin` dashboard

## Troubleshooting

### Error: "auth/invalid-credential"
**Solution**: The user doesn't exist in Firebase yet
- Go to Firebase Console → Authentication → Users
- Verify the admin user exists
- Check the email/password are correct
- Try creating a new user if needed

### Error: "Access denied. Not an admin user."
**Solution**: The custom admin claim isn't set
- Run the `set-admin-claim.js` script with the correct UID
- Verify the script ran without errors
- Log out and log back in (custom claims take a moment to sync)

### Error: Firebase credentials not configured
**Solution**: Environment variables aren't set
- Check `.env` has all `VITE_FIREBASE_*` variables
- Restart dev server after updating `.env`
- Run: `npm run dev`

### Can't access Firebase Console?
**Solution**: Check your Firebase project
- Make sure you're logged into the correct Google account
- Verify you have owner/editor access to the Firebase project
- Try logging out of Firebase Console and back in

## Environment Setup

Ensure your `.env` file has Firebase credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Admin Features Available

Once logged in as admin, access:

- **`/admin`** - Main dashboard with orders, revenue, inventory
- **`/admin/orders/tracking`** - Manage order tracking (NEW)
- **Logout** - Available in top right of dashboard

## Creating Multiple Admin Users

To add more admins:

1. Create user in Firebase Console (repeat Step 1)
2. Get the new User UID
3. Update `set-admin-claim.js` with the new UID
4. Run the script again
5. Repeat for each admin user

## Security Notes

- ✅ Use strong, unique passwords
- ✅ Store admin passwords securely
- ✅ Only create admin accounts for authorized personnel
- ✅ Use custom claims (not Firestore) for security
- ✅ Regularly rotate admin passwords
- ✅ Monitor Firebase authentication logs

## Development vs Production

### Development
- Can use test Firebase project
- Test credentials fine
- Can reset/recreate users easily

### Production
- Use production Firebase project
- Use strong passwords
- Set up backup admin accounts
- Enable two-factor authentication if available
- Monitor login attempts

## Quick Reference

| Task | Command/Action |
|------|---|
| Create admin user | Firebase Console → Auth → Add User |
| Set admin claim | `node set-admin-claim.js` |
| Login to admin | Visit `/admin/login` |
| View dashboard | `/admin` (after login) |
| Manage orders | `/admin/orders/tracking` (new feature) |
| Logout | Click "Logout Admin" in dashboard |

## Common Mistakes to Avoid

❌ Using wrong UID in `set-admin-claim.js`
✅ Copy UID directly from Firebase Console

❌ Running script without `service-account.json`
✅ Ensure service account file exists in project root

❌ Forgetting to update `.env` with Firebase keys
✅ Set all `VITE_FIREBASE_*` variables before starting dev server

❌ Not waiting for custom claims to sync
✅ Give it 30 seconds, then logout/login again

❌ Using incorrect email when creating user
✅ Double-check email spelling before creating

## Still Having Issues?

1. **Check browser console** - See exact error message
2. **Check Firebase Console** - Verify user exists
3. **Verify .env variables** - Ensure Firebase config is complete
4. **Restart dev server** - Sometimes needed after .env changes
5. **Clear browser cache** - Try incognito/private window
6. **Check Firebase logs** - Dashboard → Logs section

## API Endpoints for Admin Features

Once authenticated as admin with custom claims:

```bash
# Manage order tracking
POST /api/orders/{orderId}/tracking
POST /api/orders/{orderId}/tracking/events
GET /api/orders/{orderId}/tracking
```

See [ORDER_TRACKING_GUIDE.md](ORDER_TRACKING_GUIDE.md) for full API documentation.

---

**Last Updated**: May 10, 2026  
**Version**: 1.0

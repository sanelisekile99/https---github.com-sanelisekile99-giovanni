# Admin Login - Quick Fix Guide

## Issue: "auth/invalid-credential" Error

**Error Message:**
```
Failed to load resource: the server responded with a status of 400 ()
FirebaseError: Firebase: Error (auth/invalid-credential)
```

**Cause:** Admin user doesn't exist in Firebase yet.

## ⚡ Quick Fix (Development)

In **development mode**, you can use test credentials immediately:

### Login with Test Credentials:
- **Email**: `admin@giovanni.com`
- **Password**: `admin123`

The login page will show you these credentials in a yellow info box.

## 🔧 Setup for Production (Firebase)

### Step 1: Create Admin User in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. **Authentication** → **Users** → **Add User**
4. Enter your admin email and password
5. Click **"Add user"**
6. **Copy the User UID** (appears in the user list)

### Step 2: Set Admin Claim
1. Open `set-admin-claim.js`
2. Replace the UID:
```javascript
const uid = "YOUR_COPIED_UID_HERE";
```
3. Run:
```bash
node set-admin-claim.js
```

### Step 3: Login
- Use your admin email and password at `/admin/login`

## 📋 Checklist

- [ ] Development mode? Use `admin@giovanni.com` / `admin123`
- [ ] Production mode? Firebase user created?
- [ ] Custom claim set with `set-admin-claim.js`?
- [ ] Waited 30 seconds for claims to sync?
- [ ] Browser cache cleared?
- [ ] Correct email/password?

## 🆘 Still Not Working?

| Symptom | Solution |
|---------|----------|
| Still getting auth/invalid-credential | Verify user exists in Firebase Console → Auth → Users |
| Access denied - not an admin | Run `set-admin-claim.js` with correct UID |
| Login works but redirects back | Logout and login again (claims take time to sync) |
| Can't find UID | Firebase Console → Auth → Users → Click user → Copy UID |
| Script fails with service-account.json error | Ensure `service-account.json` exists in project root |

## 📚 Full Setup Guide

See [ADMIN_SETUP_GUIDE.md](ADMIN_SETUP_GUIDE.md) for complete instructions.

## Quick Links

- **Admin Dashboard**: `/admin`
- **Order Tracking**: `/admin/orders/tracking` (after login)
- **Test Credentials** (dev only): `admin@giovanni.com` / `admin123`

---

**TL;DR**: In development, use `admin@giovanni.com` / `admin123`. For production, create a Firebase user and set the admin claim.

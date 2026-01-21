# Troubleshooting Guide

## Common Issues and Solutions

### 1. Firebase Connection Issues

**Problem:** `Error: firebase-admin initialization failed` or `Error: FIREBASE_CONFIG not set`

**Solutions:**
- ✅ Ensure `firebase-service-account.json` exists in the `backend/` directory
- ✅ Download fresh service account from Firebase Console (Project Settings → Service Accounts → Generate New Private Key)
- ✅ Verify the JSON file has all required fields: `type`, `project_id`, `private_key_id`, `private_key`, `client_email`, `client_id`, `auth_uri`, `token_uri`
- ✅ Check `.env` file has correct path: `FIREBASE_CONFIG=./firebase-service-account.json`

### 2. Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
- ✅ Change port in `server.js`: `const PORT = process.env.PORT || 3001;`
- ✅ Or kill existing process:
  - **Windows:** `netstat -ano | findstr :5000` → `taskkill /PID <PID> /F`
  - **Mac/Linux:** `lsof -i :5000` → `kill -9 <PID>`

### 3. CORS Errors in Frontend

**Problem:** `Access to XMLHttpRequest at 'http://localhost:5000/...' from origin 'file://...' has been blocked by CORS policy`

**Solutions:**
- ✅ Ensure backend is running: `npm run dev` in `backend/` folder
- ✅ Check CORS is enabled in `server.js`: `app.use(cors())`
- ✅ If using local file protocol, use a simple HTTP server:
  ```bash
  # Python 3
  cd frontend-folder
  python -m http.server 3000
  
  # Node.js
  npx http-server -p 3000
  ```
- ✅ Update API_BASE_URL if using different port:
  ```javascript
  const API_BASE_URL = 'http://localhost:5000';
  ```

### 4. Login Fails - "Invalid Credentials"

**Problem:** Login always fails even with correct email/password

**Solutions:**
- ✅ Verify user exists in Firebase Realtime Database:
  - Go to Firebase Console → Realtime Database
  - Look in `/users` node for the email address
- ✅ Check password is hashed correctly:
  - Verify user record has `password` field that starts with `$2a$` or `$2b$` (bcrypt hash)
- ✅ Ensure JWT_SECRET is set in `.env`:
  ```
  JWT_SECRET=your-secret-key-123456
  ```
- ✅ Test with Postman using exact credentials

### 5. File Upload Fails

**Problem:** `Error uploading file` or file doesn't appear in upload history

**Solutions:**
- ✅ Check file size limit (default 10MB):
  - Update in `routes/uploads.js`: `limits: { fileSize: 50 * 1024 * 1024 }`
- ✅ Verify Firebase Storage is enabled:
  - Firebase Console → Storage → Create bucket if needed
- ✅ Check file permissions in Firebase:
  - Go to Storage rules, should allow authenticated users to read/write
- ✅ Ensure user is logged in:
  - Check localStorage has `authToken`
  - Verify token is valid with `POST /api/auth/verify`
- ✅ Check console logs for detailed error message:
  - Backend: Look in terminal where `npm run dev` is running
  - Frontend: Press F12 → Console tab → Look for red error messages

### 6. Admin Dashboard Shows No Users/Uploads

**Problem:** Admin dashboard loads but tables are empty

**Solutions:**
- ✅ Ensure logged in with admin account:
  - Check `currentUser.role === 'admin'` in browser console
  ```javascript
  const user = JSON.parse(localStorage.getItem('currentUser'));
  console.log(user.role); // Should be 'admin'
  ```
- ✅ Create a test user first:
  - Use register endpoint or admin "Add User" form
  - Verify in Firebase Console under `/users`
- ✅ Check API is returning data:
  - Open Postman → GET `/api/users`
  - Add header: `Authorization: Bearer YOUR_TOKEN`
  - Should return array of users
- ✅ Check browser console for API errors:
  - F12 → Network tab → Check requests to `/api/users` and `/api/uploads`
  - Look at response body for error message

### 7. "Unauthorized" Errors in Admin Functions

**Problem:** `Error: Unauthorized. Admin access required.` when trying to add/edit/delete users

**Solutions:**
- ✅ Verify user role is 'admin' in Firebase:
  - Database → Find user → Check `role: "admin"`
- ✅ Ensure JWT token includes role:
  - Token is created with role in `middleware/auth.js`
  - Verify token hasn't expired (default 24 hours):
  ```javascript
  const user = JSON.parse(localStorage.getItem('currentUser'));
  console.log(new Date(user.loginTime + 24*60*60*1000)); // Expiry time
  ```
- ✅ Re-login to refresh token:
  - Clear localStorage and login again
  - Or check "Remember me" and logout properly

### 8. Database Not Persisting Data

**Problem:** Data saves in frontend but doesn't appear in Firebase or disappears on reload

**Solutions:**
- ✅ Verify Firebase Realtime Database is connected:
  - Check `config/firebase.js` initializes correctly
  - Look for errors in backend terminal
- ✅ Check database rules allow writes:
  - Firebase Console → Realtime Database → Rules tab
  - Ensure authenticated users can write (not just read)
- ✅ Verify `.env` has correct Firebase credentials:
  - `FIREBASE_CONFIG` path should be correct
  - All fields in JSON should be non-empty
- ✅ Check network tab:
  - F12 → Network tab → Look for failed requests
  - 403 = Permission denied (check Firebase rules)
  - 500 = Server error (check backend terminal)

### 9. Backend Crashes on Startup

**Problem:** `npm run dev` starts but crashes with an error after a few seconds

**Solutions:**
- ✅ Check for missing dependencies:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- ✅ Review error message in terminal:
  - Look for "Cannot find module" → Missing dependency
  - Look for "Cannot read property" → Code error
- ✅ Verify all required files exist:
  ```bash
  backend/
  ├── server.js ✓
  ├── package.json ✓
  ├── .env ✓
  ├── firebase-service-account.json ✓
  ├── config/
  │   └── firebase.js ✓
  ├── middleware/
  │   └── auth.js ✓
  └── routes/
      ├── auth.js ✓
      ├── users.js ✓
      └── uploads.js ✓
  ```
- ✅ Check Node.js version (should be 12+):
  ```bash
  node --version
  ```

### 10. "Cannot find module" Error

**Problem:** `Error: Cannot find module 'express'` or similar

**Solutions:**
- ✅ Install all dependencies:
  ```bash
  cd backend
  npm install
  ```
- ✅ Clear npm cache and reinstall:
  ```bash
  npm cache clean --force
  npm install
  ```
- ✅ Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- ✅ Check `package.json` has all dependencies:
  - Must include: express, firebase-admin, multer, bcryptjs, jwt-simple, uuid, cors

### 11. Token Expiration Issues

**Problem:** User gets logged out after a period of time or "Invalid token" error

**Solutions:**
- ✅ Increase token expiration in `middleware/auth.js`:
  ```javascript
  const token = jwt.encode({
    ...tokenData,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days instead of 24
  }, JWT_SECRET);
  ```
- ✅ Refresh token on page load:
  - Check `user-dashboard.js` and `admin-dashboard.js` for token refresh logic
- ✅ Store token expiry time:
  - Save expiry in localStorage: `expireTime: new Date().getTime() + (24*60*60*1000)`
  - Check before making requests: `if (Date.now() > expireTime) logout()`

### 12. Search/Filter Not Working in Admin Dashboard

**Problem:** Search or filter buttons don't filter users/uploads

**Solutions:**
- ✅ Check search input value:
  - F12 → Console: `document.getElementById('searchInput').value`
  - Should contain your search text
- ✅ Verify filter functions exist:
  - `filterUsers()` and `filterUploads()` should be defined in `admin-dashboard-script.js`
- ✅ Check if data is loaded:
  - Verify users/uploads array is populated before filtering
  - Look in browser console: `console.log(users, uploads)`
- ✅ Test manual filtering:
  - In console: `users.filter(u => u.email.includes('test'))`
  - If this works, check filter button click handler

### 13. Settings Page Not Updating

**Problem:** Changes in user settings don't save

**Solutions:**
- ✅ Ensure user ID is available:
  ```javascript
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  console.log(currentUser.uid); // Should not be empty
  ```
- ✅ Check if API endpoint exists:
  - Should be PUT `/api/users/{userId}`
  - Verify in `routes/users.js`
- ✅ Add error logging:
  ```javascript
  fetch(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }).then(r => r.json()).then(d => console.log('Result:', d));
  ```

### 14. Export to CSV Not Working

**Problem:** CSV download button doesn't work or creates empty file

**Solutions:**
- ✅ Check PapaParse is loaded:
  - Should be in script tags: `<script src="https://cdnjs.cloudflare.com/ajax/libs/papaparse/5.4.1/papaparse.min.js"></script>`
- ✅ Verify data exists before export:
  - `console.log(uploadHistory)` should show data
- ✅ Check browser download settings:
  - Browser may block downloads if not allowed
  - Check browser's download history or Downloads folder
- ✅ Test with sample data:
  - Add a test upload first, then try exporting

### 15. Production Deployment Issues

**Problem:** Backend doesn't work when deployed to Heroku/Firebase/AWS

**Solutions:**
- ✅ Update environment variables on hosting platform:
  - Add all variables from `.env` to platform's config/secrets
  - Include Firebase credentials
- ✅ Update CORS in `server.js`:
  ```javascript
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'https://your-frontend-domain.com'
    ]
  }));
  ```
- ✅ Update API_BASE_URL in frontend files:
  ```javascript
  const API_BASE_URL = 'https://your-backend-domain.com';
  ```
- ✅ Check backend logs on hosting platform:
  - Heroku: `heroku logs --tail`
  - Firebase: Cloud Logging
  - AWS: CloudWatch logs

## Quick Debugging Checklist

- [ ] Backend running? `npm run dev` in backend folder
- [ ] Firebase connected? Check console for initialization message
- [ ] Port correct? Check `API_BASE_URL` matches backend port
- [ ] User logged in? Check localStorage `authToken`
- [ ] Token valid? Try `POST /api/auth/verify` in Postman
- [ ] Data in database? Check Firebase Console
- [ ] No console errors? Press F12 and check for red messages
- [ ] File exists? Verify all files listed above are created
- [ ] Dependencies installed? Run `npm install` in backend

## Need More Help?

1. **Check logs:**
   - Backend: Look at terminal where `npm run dev` runs
   - Frontend: Press F12 → Console tab
   - Network: F12 → Network tab → check request/response

2. **Test with Postman:**
   - Import `Dashboard-API.postman_collection.json`
   - Replace YOUR_JWT_TOKEN with real token
   - Test each endpoint individually

3. **Check Firebase Console:**
   - Realtime Database → See all data in real-time
   - Storage → See uploaded files
   - Project Settings → Check credentials

4. **Search Error Message:**
   - Copy exact error message
   - Search in backend files
   - Look for corresponding try/catch block

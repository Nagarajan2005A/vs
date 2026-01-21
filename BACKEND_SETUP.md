# Complete Backend Setup Guide

## 🚀 Quick Start

### Step 1: Setup Firebase

1. **Create Firebase Project**
   - Go to https://firebase.google.com/
   - Click "Get started"
   - Create a new project

2. **Enable Realtime Database**
   - In Firebase Console → Build → Realtime Database
   - Click "Create Database"
   - Start in test mode (change rules later for production)

3. **Get Service Account Key**
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `firebase-service-account.json` in backend folder

### Step 2: Install Backend

```bash
cd backend
npm install
```

### Step 3: Configure Environment

1. Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

2. Fill in Firebase credentials:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
JWT_SECRET=your-secret-key-change-in-production
```

### Step 4: Start Backend Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Server will run on: `http://localhost:5000`

## 📁 File Structure

```
backend/
├── server.js                 # Main Express server
├── package.json             # Dependencies
├── .env.example            # Environment template
├── .env                    # Your configuration
├── firebase-service-account.json  # Firebase credentials
├── config/
│   └── firebase.js         # Firebase initialization
├── middleware/
│   └── auth.js            # JWT & authentication
├── routes/
│   ├── auth.js            # Login/Register endpoints
│   ├── users.js           # User management endpoints
│   └── uploads.js         # File upload endpoints
└── uploads/               # Uploaded files storage
```

## 🔐 Database Rules

Add these rules to your Firebase Realtime Database for security:

```json
{
  "rules": {
    "users": {
      ".read": "root.child('users').child(auth.uid).exists() || root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$uid": {
        ".validate": "newData.hasChildren(['userId', 'email', 'name'])"
      }
    },
    "uploads": {
      ".read": "auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}
```

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "userType": "user"
  }'
```

### 3. Upload File
```bash
curl -X POST http://localhost:5000/api/uploads/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@yourfile.csv"
```

## 🌐 Frontend Configuration

Update your frontend to use the backend:

1. In `login-script.js` - Already configured to use `http://localhost:5000/api`
2. In `user-dashboard-script.js` - Already configured
3. In `admin-dashboard-script.js` - Already configured

To change API URL, update the `API_BASE_URL` variable in each file.

## 📊 API Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Error Response
```json
{
  "error": "Invalid email or password",
  "status": 401
}
```

## 🚀 Deployment Options

### Deploy to Firebase Functions

```bash
firebase init functions
firebase deploy --only functions
```

### Deploy to Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set FIREBASE_PROJECT_ID=your_project

# Deploy
git push heroku main
```

### Deploy to AWS Lambda

1. Install Serverless Framework
```bash
npm install -g serverless
```

2. Create serverless.yml
```yaml
service: dashboard-backend

provider:
  name: aws
  runtime: nodejs18.x

functions:
  api:
    handler: handler.main
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

### Deploy to Google Cloud Run

```bash
gcloud run deploy dashboard-backend \
  --source . \
  --platform managed \
  --region us-central1
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS only in production
- [ ] Set up CORS properly for your domain
- [ ] Enable Firebase security rules
- [ ] Add rate limiting to prevent abuse
- [ ] Sanitize all user inputs
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS-only cookies
- [ ] Set up monitoring and logging
- [ ] Regular security audits

## 🐛 Troubleshooting

### Firebase Connection Error
```
Solution: Check firebase-service-account.json path and permissions
```

### CORS Error
```
Solution: Update FRONTEND_URL in .env to your frontend URL
```

### File Upload Fails
```
Solution: Check uploads/ directory exists and is writable
chmod 755 uploads/
```

### Token Expired
```
Solution: User needs to login again to get new token
```

### Database Read/Write Errors
```
Solution: Update Firebase security rules or check user permissions
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

## 💡 Next Steps

1. ✅ Backend is running
2. ✅ Frontend is configured to use API
3. Test login and file upload
4. Deploy to production
5. Monitor and optimize performance

## 📞 Support

For issues or questions:
1. Check the error logs in terminal
2. Review API response messages
3. Check Firebase console for database issues
4. Verify environment variables are set correctly

<<<<<<< HEAD
# 📊 Complete Dashboard System with Backend

A full-stack application with user authentication, file upload management, and admin controls, powered by Express.js and Firebase.

## 📋 Features

### User Features
- ✅ User authentication (register/login)
- ✅ Excel/CSV file upload with progress tracking
- ✅ Upload history with timestamps
- ✅ Search and filter uploads
- ✅ Download uploaded data
- ✅ User analytics and statistics
- ✅ Profile settings

### Admin Features
- ✅ User management (create, edit, delete)
- ✅ Role and permission assignment
- ✅ View all uploads system-wide
- ✅ System statistics dashboard
- ✅ Generate reports (CSV, Excel, PDF)
- ✅ Monitor user activity
- ✅ System configuration

### Technical Features
- ✅ JWT-based authentication
- ✅ Firebase Realtime Database
- ✅ RESTful API
- ✅ File upload handling with Multer
- ✅ Data validation
- ✅ Error handling
- ✅ CORS enabled
- ✅ Responsive design
- ✅ Mobile friendly

## 📁 Project Structure

```
project/
├── frontend files/
│   ├── login.html                    # Login page
│   ├── login-styles.css
│   ├── login-script.js
│   ├── user-dashboard.html           # User dashboard
│   ├── user-dashboard-styles.css
│   ├── user-dashboard-script.js
│   ├── admin-dashboard.html          # Admin dashboard
│   ├── admin-dashboard-styles.css
│   ├── admin-dashboard-script.js
│   ├── api-service.js                # API client
│   └── index.html                    # Original dashboard (optional)
│
├── backend/
│   ├── server.js                     # Main server
│   ├── package.json                  # Dependencies
│   ├── .env.example                  # Environment template
│   ├── .env                          # Your config
│   ├── firebase-service-account.json # Firebase credentials
│   ├── config/
│   │   └── firebase.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── uploads.js
│   ├── uploads/                      # Uploaded files
│   ├── setup.bat                     # Windows setup
│   ├── setup.sh                      # Mac/Linux setup
│   └── README.md                     # Backend docs
│
├── BACKEND_SETUP.md                  # Setup guide
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Modern web browser

### Installation

#### 1. Backend Setup

**Windows:**
```bash
cd backend
setup.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

**Manual:**
```bash
cd backend
npm install
cp .env.example .env
```

#### 2. Configure Firebase

1. Get credentials from Firebase Console
2. Download `firebase-service-account.json`
3. Place in `backend/` folder
4. Update `backend/.env` with Firebase config

#### 3. Start Backend

```bash
cd backend
npm run dev
```

Server runs on: `http://localhost:5000`

#### 4. Open Frontend

Open `login.html` in your browser

```
file:///path/to/project/login.html
```

Or serve with a simple HTTP server:
```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

## 🔐 Default Credentials

The system includes seed data. Create new accounts via registration or:

**Demo User:**
- Email: `demo@example.com`
- Password: `password123`

**Demo Admin:**
- Email: `admin@example.com`
- Password: `admin123`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify token
- `POST /api/auth/logout` - User logout

### Users (Requires Auth)
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/{userId}` - Get user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/{userId}` - Update user
- `DELETE /api/users/{userId}` - Delete user (Admin)
- `GET /api/users/{userId}/stats` - User statistics

### Uploads (Requires Auth)
- `POST /api/uploads/upload` - Upload file
- `GET /api/uploads/history/{userId}` - User uploads
- `GET /api/uploads` - All uploads (Admin)
- `GET /api/uploads/{uploadId}` - Get upload
- `DELETE /api/uploads/{uploadId}` - Delete upload
- `GET /api/uploads/stats/system` - System stats (Admin)

## 🔄 Workflow

### User Workflow
1. Register or Login
2. Go to "Upload Data" section
3. Select CSV/Excel file
4. Track upload progress
5. View uploaded data
6. Search and download past uploads
7. Check analytics

### Admin Workflow
1. Login as admin
2. View all users and statistics
3. Create/edit/delete users
4. Assign roles and permissions
5. Monitor all uploads
6. Generate reports
7. Configure system settings

## 🛠️ Customization

### Change API URL
Edit `API_BASE_URL` in:
- `login-script.js`
- `user-dashboard-script.js`
- `admin-dashboard-script.js`

### Change Upload Limit
Edit in `backend/.env`:
```
MAX_FILE_SIZE=10485760
```

### Change Database
Update Firebase config in `backend/.env`

## 📊 Database Structure

```
Firebase Realtime Database
├── users/
│   └── {userId}
│       ├── userId
│       ├── name
│       ├── email
│       ├── password (hashed)
│       ├── role
│       ├── status
│       ├── joined
│       └── uploads
│
└── uploads/
    └── {uploadId}
        ├── uploadId
        ├── userId
        ├── fileName
        ├── fileSize
        ├── uploadDate
        ├── recordCount
        ├── status
        └── fileUrl
```

## 🔒 Security

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Request validation
- ✅ CORS protection
- ✅ Role-based access control
- ✅ Input sanitization
- ✅ Secure headers

### For Production
1. Change `JWT_SECRET` in `.env`
2. Enable Firebase security rules
3. Use HTTPS only
4. Set proper CORS origins
5. Enable rate limiting
6. Regular security audits

## 🐛 Troubleshooting

### Backend won't start
```
Error: Firebase not initialized
Solution: Check firebase-service-account.json exists
```

### Login fails
```
Error: Cannot POST /api/auth/login
Solution: Ensure backend is running on localhost:5000
```

### CORS error in console
```
Error: Access-Control-Allow-Origin missing
Solution: Check backend CORS configuration in .env
```

### File upload fails
```
Error: 400 Bad Request
Solution: Check file format (must be CSV, XLSX, or XLS)
```

### Database connection error
```
Error: Cannot read property 'ref' of undefined
Solution: Update Firebase credentials in .env
```

## 📈 Performance Tips

- Use Redis for session management (production)
- Implement file compression
- Add database indexing
- Use CDN for static files
- Enable gzip compression
- Implement caching strategies

## 🚀 Deployment

### Heroku
```bash
heroku create your-app
git push heroku main
heroku config:set JWT_SECRET=your_secret
```

### Firebase Functions
```bash
firebase deploy --only functions
```

### AWS Lambda
```bash
serverless deploy
```

### Google Cloud Run
```bash
gcloud run deploy dashboard-backend --source .
```

## 📞 Support

For issues:
1. Check browser console for errors
2. Check backend terminal logs
3. Verify Firebase credentials
4. Check network tab in DevTools
5. Review API response messages

## 📝 License

This project is provided as-is for educational purposes.

## 🎯 Future Enhancements

- [ ] Two-factor authentication
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Batch operations
- [ ] Data encryption
- [ ] Audit logs
- [ ] Custom dashboards
- [ ] API rate limiting
- [ ] WebSocket real-time updates
- [ ] Mobile app

## ✨ Credits

Built with:
- Node.js & Express.js
- Firebase Realtime Database
- HTML5, CSS3, JavaScript
- Multer for file uploads
- JWT for authentication
- bcryptjs for password hashing

---

**Made with ❤️ for data management**

Start managing your data efficiently today! 🎉
=======
# vs
>>>>>>> 376b55ff737f9233a24aebfa334b27bd7679bc94

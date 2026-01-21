# Dashboard Backend API

Complete backend for User and Admin Dashboard with Firebase integration.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at https://firebase.google.com/
2. Enable Realtime Database
3. Enable Storage
4. Download your service account key JSON file
5. Place it in the backend root directory as `firebase-service-account.json`
6. Update `.env` file with your Firebase credentials

### 3. Create .env File

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
}
```

#### Login
```
POST /api/auth/login
{
    "email": "john@example.com",
    "password": "password123",
    "userType": "user"
}
```

#### Verify Token
```
POST /api/auth/verify
{
    "token": "jwt_token_here"
}
```

### User Management Routes

#### Get All Users (Admin only)
```
GET /api/users
Headers: Authorization: Bearer {token}
```

#### Get User by ID
```
GET /api/users/{userId}
Headers: Authorization: Bearer {token}
```

#### Create User (Admin only)
```
POST /api/users
Headers: Authorization: Bearer {token}
{
    "name": "New User",
    "email": "new@example.com",
    "password": "password123",
    "role": "user"
}
```

#### Update User
```
PUT /api/users/{userId}
Headers: Authorization: Bearer {token}
{
    "name": "Updated Name",
    "role": "editor",
    "status": "active"
}
```

#### Delete User (Admin only)
```
DELETE /api/users/{userId}
Headers: Authorization: Bearer {token}
```

#### Get User Statistics
```
GET /api/users/{userId}/stats
Headers: Authorization: Bearer {token}
```

### Upload Management Routes

#### Upload File
```
POST /api/uploads/upload
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Files: file (csv, xlsx, xls)
```

#### Get Upload History
```
GET /api/uploads/history/{userId}
Headers: Authorization: Bearer {token}
```

#### Get All Uploads (Admin only)
```
GET /api/uploads
Headers: Authorization: Bearer {token}
```

#### Get Upload by ID
```
GET /api/uploads/{uploadId}
Headers: Authorization: Bearer {token}
```

#### Delete Upload
```
DELETE /api/uploads/{uploadId}
Headers: Authorization: Bearer {token}
```

#### Get System Statistics (Admin only)
```
GET /api/uploads/stats/system
Headers: Authorization: Bearer {token}
```

## Response Format

### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": {}
}
```

### Error Response
```json
{
    "error": "Error message",
    "status": 400
}
```

## Database Structure (Firebase)

```
firebase
├── users/
│   ├── {userId}
│   │   ├── userId
│   │   ├── name
│   │   ├── email
│   │   ├── password (hashed)
│   │   ├── role (user, admin, editor)
│   │   ├── status (active, inactive)
│   │   ├── joined
│   │   ├── uploads
│   │   └── createdAt
│
├── uploads/
│   ├── {uploadId}
│   │   ├── uploadId
│   │   ├── userId
│   │   ├── fileName
│   │   ├── fileSize
│   │   ├── uploadDate
│   │   ├── recordCount
│   │   ├── status
│   │   └── fileUrl
```

## Deployment

### Deploy to Firebase Functions

```bash
firebase deploy --only functions
```

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
heroku config:set JWT_SECRET=your_secret
```

### Deploy to AWS, Google Cloud, or Azure

Follow their respective Node.js deployment guides.

## Security Considerations

1. Change JWT_SECRET in production
2. Use HTTPS only
3. Implement rate limiting
4. Add CSRF protection
5. Sanitize user inputs
6. Use environment variables for sensitive data
7. Enable Firebase security rules
8. Regular security audits

## Troubleshooting

- **Firebase not initializing**: Check service account key and permissions
- **CORS errors**: Verify FRONTEND_URL in .env
- **File upload fails**: Check upload directory permissions
- **Token expired**: Regenerate token through login

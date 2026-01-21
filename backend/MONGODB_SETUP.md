# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up" and create a free account
3. Verify your email

## Step 2: Create a Cluster
1. Once logged in, click "Create a Deployment"
2. Select **"Shared"** (Free tier)
3. Choose your preferred cloud provider and region
4. Click "Create Deployment"
5. Wait for the cluster to be provisioned (takes a few minutes)

## Step 3: Set Up Authentication
1. Go to "Security" → "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username (e.g., `dashboard-user`)
5. Enter password (save this!)
6. Set privileges to "Read and write to any database"
7. Click "Add User"

## Step 4: Allow Network Access
1. Go to "Security" → "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (or restrict to your IP)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Deployment" → "Databases"
2. Click "Connect" next to your cluster
3. Choose "Drivers"
4. Select "Node.js" and version 4.x
5. Copy the connection string

## Step 6: Update .env File
```bash
# Replace in your .env file:
# mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority

# Example:
MONGODB_URI=mongodb+srv://dashboard-user:MyPassword123@cluster0.abc123.mongodb.net/dashboard-db?retryWrites=true&w=majority
```

## Step 7: Start Backend
```bash
cd backend
npm install
npm run dev
```

## Troubleshooting

### "MongoError: connect ENOTFOUND"
- Check your MongoDB URI is correct
- Ensure Network Access is configured

### "Authentication failed"
- Verify username and password in the connection string
- Check special characters are URL-encoded

### "No database selected"
- Add database name to URI: `.../database-name?...`

## Commands for Backend

```bash
# Install dependencies
npm install

# Run in development (with auto-reload)
npm run dev

# Run in production
npm start
```

## Verify Connection
Once backend is running, you should see:
```
✓ MongoDB Atlas connected successfully
Server running on port 5000
```

## Next Steps
1. Open `login.html` in browser
2. Register a new user or login
3. Test file upload
4. Check MongoDB Atlas console to see your data live

const admin = require('firebase-admin');

// Initialize Firebase Admin
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL
};

// Initialize Firebase Admin SDK with service account
let initialized = false;

try {
    // Make sure to add your service account JSON file
    const serviceAccount = require('../firebase-service-account.json');
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    console.log('✓ Firebase initialized with service account');
    initialized = true;
} catch (error) {
    console.warn('⚠ Firebase service account not found.');
}

// Fallback initialization if service account failed
if (!initialized) {
    try {
        if (process.env.FIREBASE_DATABASE_URL && process.env.FIREBASE_DATABASE_URL !== 'https://demo-project.firebaseio.com') {
            admin.initializeApp({
                databaseURL: process.env.FIREBASE_DATABASE_URL,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
            console.log('✓ Firebase initialized with environment variables');
        } else {
            console.warn('⚠ Using demo mode - Connect real Firebase to proceed');
            // For testing without Firebase
            admin.initializeApp({
                databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://demo-project.firebaseio.com'
            });
            console.log('📝 Server running in DEMO MODE - Data will not persist');
        }
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error.message);
        process.exit(1);
    }
}

// Get references
const db = admin.database();
const storage = admin.storage();
const auth = admin.auth();

module.exports = {
    admin,
    db,
    storage,
    auth,
    firebaseConfig
};

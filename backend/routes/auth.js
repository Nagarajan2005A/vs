const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/schemas');
const { generateToken, hashPassword, comparePassword } = require('../middleware/auth');

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const userId = uuidv4();
        const hashedPassword = hashPassword(password);

        const newUser = new User({
            _id: userId,
            name,
            email,
            password: hashedPassword,
            role,
            status: 'active',
            joinedDate: new Date(),
            uploadCount: 0,
            permissions: []
        });

        await newUser.save();

        const token = generateToken(userId, email, role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                userId,
                name,
                email,
                role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user from database
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check password
        if (!comparePassword(password, userData.password)) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Check role if admin login
        if (userType === 'admin' && userData.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized as admin' });
        }

        // Update last login
        userData.lastLogin = new Date();
        await userData.save();

        // Generate token
        const token = generateToken(userData._id, email, userData.role);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                userId: userData._id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify Token
router.post('/verify', (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const jwt = require('jwt-simple');
        const decoded = jwt.decode(token, process.env.JWT_SECRET);

        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Logout (client-side mainly, but can be used to invalidate tokens server-side if needed)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

module.exports = router;

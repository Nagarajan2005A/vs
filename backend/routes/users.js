const express = require('express');
const router = express.Router();
const { User, Upload } = require('../models/schemas');
const { verifyTokenMiddleware, hashPassword } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all users (Admin only)
router.get('/', verifyTokenMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const users = await User.find({}).select('-password');

        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
router.get('/:userId', verifyTokenMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // Users can only see their own profile unless admin
        if (req.user.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user (Admin only)
router.post('/', verifyTokenMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { name, email, password, role = 'user', status = 'active' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const userId = uuidv4();
        const hashedPassword = hashPassword(password);

        const newUser = new User({
            _id: userId,
            name,
            email,
            password: hashedPassword,
            role,
            status,
            joinedDate: new Date(),
            uploadCount: 0,
            permissions: []
        });

        await newUser.save();

        const userResponse = await User.findById(userId).select('-password');

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user (Admin or self)
router.put('/:userId', verifyTokenMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, role, status } = req.body;

        // Check authorization
        if (req.user.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (name) user.name = name;
        if (role && req.user.role === 'admin') user.role = role;
        if (status && req.user.role === 'admin') user.status = status;

        await user.save();

        const updatedUser = await User.findById(userId).select('-password');

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user (Admin only)
router.delete('/:userId', verifyTokenMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user statistics (Admin)
router.get('/:userId/stats', verifyTokenMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const uploads = await Upload.find({ userId });
        const uploadStats = {
            totalUploads: uploads.length,
            totalRecords: 0,
            totalSize: 0,
            lastUpload: null
        };

        uploads.forEach((upload) => {
            uploadStats.totalRecords += upload.recordCount || 0;
            uploadStats.totalSize += upload.fileSize || 0;
            
            if (!uploadStats.lastUpload || new Date(upload.uploadDate) > new Date(uploadStats.lastUpload)) {
                uploadStats.lastUpload = upload.uploadDate;
            }
        });

        res.json({
            success: true,
            stats: uploadStats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

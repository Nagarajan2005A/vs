const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Upload, User } = require('../models/schemas');
const { verifyTokenMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /csv|xlsx|xls/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only CSV and Excel files are allowed'));
        }
    }
});

// Upload file
router.post('/upload', verifyTokenMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploadId = uuidv4();
        const userId = req.user.userId;
        const fileName = req.file.originalname;
        const fileSize = (req.file.size / 1024 / 1024).toFixed(2);
        const uploadDate = new Date();

        // Parse CSV/Excel file to get record count
        let recordCount = 0;
        
        // Simulate record count (in production, parse the actual file)
        recordCount = Math.floor(Math.random() * 1000) + 1;

        const newUpload = new Upload({
            _id: uploadId,
            userId,
            fileName,
            fileSize: parseFloat(fileSize),
            uploadDate,
            recordCount,
            status: 'completed',
            fileUrl: `/uploads/${req.file.filename}`,
            data: []
        });

        // Save to database
        await newUpload.save();

        // Update user upload count
        const user = await User.findById(userId);
        if (user) {
            user.uploadCount = (user.uploadCount || 0) + 1;
            await user.save();
        }

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            upload: newUpload
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
});

// Get upload history for user
router.get('/history/:userId', verifyTokenMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // Check authorization
        if (req.user.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const uploads = await Upload.find({ userId });

        // Sort by date (newest first)
        uploads.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        res.json({
            success: true,
            uploads
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all uploads (Admin only)
router.get('/', verifyTokenMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const uploads = await Upload.find({});

        // Sort by date (newest first)
        uploads.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

        res.json({
            success: true,
            uploads
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get upload by ID
router.get('/:uploadId', verifyTokenMiddleware, async (req, res) => {
    try {
        const { uploadId } = req.params;

        const upload = await Upload.findById(uploadId);

        if (!upload) {
            return res.status(404).json({ error: 'Upload not found' });
        }

        // Check authorization
        if (req.user.userId !== upload.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({
            success: true,
            upload
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete upload
router.delete('/:uploadId', verifyTokenMiddleware, async (req, res) => {
    try {
        const { uploadId } = req.params;

        const upload = await Upload.findById(uploadId);

        if (!upload) {
            return res.status(404).json({ error: 'Upload not found' });
        }

        // Check authorization
        if (req.user.userId !== upload.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Delete from database
        await Upload.findByIdAndDelete(uploadId);

        // Delete file from disk
        const filePath = path.join(__dirname, '..', upload.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({
            success: true,
            message: 'Upload deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get system statistics (Admin only)
router.get('/stats/system', verifyTokenMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const users = await User.find({});
        const uploads = await Upload.find({});

        let totalUsers = users.length;
        let activeUsers = users.filter(u => u.status === 'active').length;
        let totalUploads = uploads.length;
        let totalRecords = 0;
        let totalSize = 0;

        uploads.forEach((upload) => {
            totalRecords += upload.recordCount || 0;
            totalSize += upload.fileSize || 0;
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalUploads,
                totalRecords,
                totalStorageUsed: totalSize.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

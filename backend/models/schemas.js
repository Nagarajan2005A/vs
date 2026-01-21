const { mongoose } = require('../config/mongodb');

const userSchema = new mongoose.Schema({
    _id: String,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'editor'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    uploadCount: {
        type: Number,
        default: 0
    },
    lastLogin: Date,
    permissions: [String]
}, { _id: false, collection: 'users' });

const uploadSchema = new mongoose.Schema({
    _id: String,
    userId: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    recordCount: {
        type: Number,
        default: 0
    },
    fileUrl: String,
    data: [mongoose.Schema.Types.Mixed],
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    }
}, { _id: false, collection: 'uploads' });

const User = mongoose.model('User', userSchema);
const Upload = mongoose.model('Upload', uploadSchema);

module.exports = {
    User,
    Upload
};

const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
function generateToken(userId, email, role) {
    const payload = {
        userId,
        email,
        role,
        iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.encode(payload, JWT_SECRET);
}

// Verify JWT token
function verifyToken(token) {
    try {
        const decoded = jwt.decode(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

// Hash password
function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

// Compare password
function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

// Middleware to verify token
function verifyTokenMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1]; // Bearer token

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    verifyTokenMiddleware
};

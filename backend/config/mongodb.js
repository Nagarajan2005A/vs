const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✓ MongoDB Atlas connected successfully');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = {
    connectMongoDB,
    mongoose
};

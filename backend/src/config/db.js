const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Increased to 30s for more stable cloud connection
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Check if it's Atlas or Local
        const isAtlas = conn.connection.host.includes('mongodb.net') || process.env.MONGO_URI.includes('mongodb.net');
        if (isAtlas) {
            console.log('☁️  Connected to MongoDB Atlas Mode');
        } else {
            console.log('🏠 Connected to Local MongoDB Mode');
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        console.log('⚠️  Please check your MONGO_URI in .env file');
        // Do not exit process in dev mode, just log error
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;

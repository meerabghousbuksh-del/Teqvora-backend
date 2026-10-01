const mongoose = require('mongoose');

async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing. Add it to your .env file.');
    }

    try {
        console.log('Trying MongoDB connection...');

        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:');
        console.error(error.message);
        throw error;
    }
}

module.exports = connectDB;
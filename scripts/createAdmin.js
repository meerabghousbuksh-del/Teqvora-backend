require('dotenv').config();

const readline = require('readline');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function createAdmin() {
    const name = (await ask('Name: ')).trim();
    const email = (await ask('Email: ')).trim().toLowerCase();
    const password = await ask('Password (min 10 characters): ');
    rl.close();

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || password.length < 10) {
        throw new Error('Invalid input. Name, a valid email and a 10+ character password are required.');
    }

    await connectDB();

    if (await User.findOne({ email })) {
        throw new Error('A user with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash });
    console.log(`Admin created: ${email}`);
}

createAdmin()
    .catch((error) => console.error(error.message))
    .finally(() => mongoose.disconnect());

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const SESSION_HOURS = 12;

function cookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.COOKIE_DOMAIN || undefined,
    };
}

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    const user = await User.findOne({ email });
    const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));

    // Same message for both cases so nobody can probe which emails exist
    if (!passwordMatches) {
        return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: `${SESSION_HOURS}h` });
    res.cookie('token', token, { ...cookieOptions(), maxAge: SESSION_HOURS * 60 * 60 * 1000 });
    res.json({ success: true, message: 'Logged in.' });
}));

router.post('/logout', (req, res) => {
    res.clearCookie('token', cookieOptions());
    res.json({ success: true, message: 'Logged out.' });
});

router.get('/me', requireAuth, (req, res) => {
    res.json({ success: true, data: { name: req.user.name, email: req.user.email } });
});

module.exports = router;

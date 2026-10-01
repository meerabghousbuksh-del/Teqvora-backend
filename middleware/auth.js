const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reads the HTTP-only "token" cookie and attaches the user to req.user
async function requireAuth(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Please log in.' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select('name email role');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Please log in.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
}

module.exports = { requireAuth };

const express = require('express');
const Visitor = require('../models/Visitor');
const { parseUserAgent, hashIp } = require('../services/analyticsService');
const { visitLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

router.post('/visit', visitLimiter, asyncHandler(async (req, res) => {
    const { visitorId, sessionId, path, title, referrer } = req.body;

    if (!ID_PATTERN.test(visitorId) || !ID_PATTERN.test(sessionId) || typeof path !== 'string' || !path.startsWith('/')) {
        return res.status(400).json({ success: false, message: 'Invalid request.' });
    }

    await Visitor.create({
        visitorId,
        sessionId,
        path: path.slice(0, 200),
        page: typeof title === 'string' ? title.slice(0, 150) : '',
        referrer: typeof referrer === 'string' && referrer ? referrer.slice(0, 100) : 'direct',
        ...parseUserAgent(req.get('user-agent')),
        // Cloudflare adds this header; without it we simply leave the country empty
        country: req.get('cf-ipcountry') || null,
        ipHash: hashIp(req.ip),
    });

    res.status(204).end();
}));

module.exports = router;

const rateLimit = require('express-rate-limit');

function createLimiter(windowMinutes, max, message) {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { success: false, message },
    });
}

module.exports = {
    apiLimiter: createLimiter(15, 300, 'Too many requests. Please slow down.'),
    contactLimiter: createLimiter(60, 5, 'Too many messages sent. Please try again later.'),
    loginLimiter: createLimiter(15, 10, 'Too many login attempts. Please try again later.'),
    visitLimiter: createLimiter(1, 60, 'Too many requests.'),
};

const crypto = require('crypto');

// Small user-agent reader, enough for dashboard charts
function parseUserAgent(ua = '') {
    let device = 'desktop';
    if (/ipad|tablet/i.test(ua)) device = 'tablet';
    else if (/mobi|android|iphone/i.test(ua)) device = 'mobile';

    let browser = 'Other';
    if (/edg\//i.test(ua)) browser = 'Edge';
    else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';

    let os = 'Other';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';
    else if (/mac os/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    return { device, browser, os };
}

// We never store the raw IP address
function hashIp(ip = '') {
    return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex');
}

module.exports = { parseUserAgent, hashIp };

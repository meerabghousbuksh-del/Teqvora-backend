const express = require('express');
const mongoose = require('mongoose');
const Visitor = require('../models/Visitor');
const Submission = require('../models/Submission');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.use(requireAuth);

const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

async function countUniqueVisitors(match = {}) {
    const result = await Visitor.aggregate([
        { $match: match },
        { $group: { _id: '$visitorId' } },
        { $count: 'total' },
    ]);
    return result.length ? result[0].total : 0;
}

async function topValues(field, match, limit = 8) {
    return Visitor.aggregate([
        { $match: match },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, label: '$_id', count: 1 } },
    ]);
}

router.get('/stats', asyncHandler(async (req, res) => {
    const today = { createdAt: { $gte: startOfToday() } };

    const [totalVisitors, todayVisitors, totalPageViews, totalSubmissions, todaySubmissions, recentSubmissions, recentActivity] =
        await Promise.all([
            countUniqueVisitors(),
            countUniqueVisitors(today),
            Visitor.countDocuments(),
            Submission.countDocuments(),
            Submission.countDocuments(today),
            Submission.find().sort({ createdAt: -1 }).limit(5).select('name email service status createdAt'),
            Visitor.find().sort({ createdAt: -1 }).limit(8).select('path referrer device createdAt'),
        ]);

    res.json({
        success: true,
        data: { totalVisitors, todayVisitors, totalPageViews, totalSubmissions, todaySubmissions, recentSubmissions, recentActivity },
    });
}));

router.get('/visitors', asyncHandler(async (req, res) => {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 90);
    const since = new Date(startOfToday().getTime() - (days - 1) * 86400000);
    const match = { createdAt: { $gte: since } };

    const perDay = await Visitor.aggregate([
        { $match: match },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                pageViews: { $sum: 1 },
                visitors: { $addToSet: '$visitorId' },
            },
        },
    ]);

    // Fill days with no traffic so the chart has no gaps
    const lookup = new Map(perDay.map((row) => [row._id, row]));
    const byDay = [];
    for (let i = 0; i < days; i++) {
        const key = new Date(since.getTime() + i * 86400000).toISOString().slice(0, 10);
        const row = lookup.get(key);
        byDay.push({ date: key, pageViews: row ? row.pageViews : 0, visitors: row ? row.visitors.length : 0 });
    }

    const [topPages, referrers, devices, browsers, operatingSystems] = await Promise.all([
        topValues('path', match),
        topValues('referrer', match),
        topValues('device', match),
        topValues('browser', match),
        topValues('os', match),
    ]);

    res.json({ success: true, data: { byDay, topPages, referrers, devices, browsers, operatingSystems } });
}));

router.get('/submissions', asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const filter = {};

    if (['new', 'read', 'replied'].includes(req.query.status)) filter.status = req.query.status;
    if (typeof req.query.service === 'string' && req.query.service) filter.service = req.query.service;

    if (typeof req.query.search === 'string' && req.query.search.trim()) {
        const pattern = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: pattern }, { email: pattern }, { subject: pattern }];
    }

    const [items, total] = await Promise.all([
        Submission.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-message'),
        Submission.countDocuments(filter),
    ]);

    res.json({ success: true, data: { items, total, page, pages: Math.max(Math.ceil(total / limit), 1) } });
}));

router.get('/submissions/:id', asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    res.json({ success: true, data: submission });
}));

module.exports = router;

const mongoose = require('mongoose');

// One document = one page view.
// Unique visitors  = distinct visitorId
// Sessions         = distinct sessionId
const visitorSchema = new mongoose.Schema(
    {
        visitorId: { type: String, required: true },
        sessionId: { type: String, required: true },
        page: { type: String, default: '' },
        path: { type: String, required: true },
        referrer: { type: String, default: 'direct' },
        device: { type: String, default: 'desktop' },
        browser: { type: String, default: 'Other' },
        os: { type: String, default: 'Other' },
        country: { type: String, default: null },
        city: { type: String, default: null },
        ipHash: { type: String, default: null },
    },
    { timestamps: { createdAt: true, updatedAt: 'lastSeenAt' } }
);

visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ visitorId: 1, createdAt: -1 });
visitorSchema.index({ sessionId: 1 });
visitorSchema.index({ path: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);

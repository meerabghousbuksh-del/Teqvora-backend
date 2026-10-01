const mongoose = require('mongoose');

// Fields match the real #contactForm in teqvora.HTML
const submissionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
        service: { type: String, required: true, trim: true },
        subject: { type: String, trim: true, maxlength: 150, default: '' },
        message: { type: String, required: true, trim: true, maxlength: 5000 },
        status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
    },
    { timestamps: true }
);

submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ status: 1, createdAt: -1 });
submissionSchema.index({ service: 1, createdAt: -1 });
submissionSchema.index({ email: 1 });

module.exports = mongoose.model('Submission', submissionSchema);

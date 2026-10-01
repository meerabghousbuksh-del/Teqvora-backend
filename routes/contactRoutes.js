const express = require('express');

const Submission = require('../models/Submission');
const services = require('../data/services.json');
const { sendSubmissionEmail } = require('../services/emailService');
const { contactLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


// =========================================
// VALIDATE CONTACT FORM
// =========================================

function validateContact(body) {
    const text = (value) => {
        return typeof value === 'string'
            ? value.trim()
            : '';
    };

    const data = {
        name: text(body.name),
        email: text(body.email).toLowerCase(),
        service: text(body.service),
        subject: text(body.subject),
        message: text(body.message)
    };

    // Name
    if (data.name.length < 2 || data.name.length > 100) {
        return {
            error: 'Please enter your name.'
        };
    }

    // Email
    if (
        !EMAIL_PATTERN.test(data.email) ||
        data.email.length > 150
    ) {
        return {
            error: 'Please enter a valid email address.'
        };
    }

    // Service
    if (!services.includes(data.service)) {
        return {
            error: 'Please select a service.'
        };
    }

    // Subject
    if (data.subject.length > 150) {
        return {
            error: 'Subject is too long.'
        };
    }

    // Message
    if (
        data.message.length < 10 ||
        data.message.length > 5000
    ) {
        return {
            error: 'Please write a message of at least 10 characters.'
        };
    }

    // Consent
    if (body.consent !== true) {
        return {
            error: 'Please agree to be contacted.'
        };
    }

    return {
        data
    };
}


// =========================================
// POST /api/contact
// =========================================

router.post(
    '/',
    contactLimiter,
    asyncHandler(async (req, res) => {

        const { data, error } = validateContact(req.body);

        // Validation error
        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        // Save submission to MongoDB
        const submission = await Submission.create(data);

        // Send notification email
        // Email failure should NOT delete the saved submission
        try {
            await sendSubmissionEmail(submission);
        } catch (emailError) {
            console.error(
                'Notification email failed:',
                emailError.message
            );
        }

        // Successful response
        return res.status(201).json({
            success: true,
            message: 'Form submitted successfully.'
        });
    })
);


module.exports = router;
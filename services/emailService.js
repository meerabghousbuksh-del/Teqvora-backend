const nodemailer = require('nodemailer');

const escapeHtml = (text) =>
    String(text).replace(/[&<>"']/g, (char) => '&#' + char.charCodeAt(0) + ';');

function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });
}

async function sendSubmissionEmail(submission) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.EMAIL_TO) {
        console.warn('Email not configured, skipping notification.');
        return;
    }

    const rows = [
        ['Name', submission.name],
        ['Email', submission.email],
        ['Service', submission.service],
        ['Subject', submission.subject || '-'],
        ['Date', submission.createdAt.toUTCString()],
        ['Message', submission.message],
    ];

    const html = rows
        .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
        .join('');

    await createTransporter().sendMail({
        from: `"TEQVORA Website" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        replyTo: submission.email,
        subject: `New inquiry: ${submission.service}`,
        html,
    });
}

module.exports = { sendSubmissionEmail };

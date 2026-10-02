require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const publicDir = path.join(__dirname, 'public');
const dashboardDir = path.join(__dirname, 'dashboard');

const isProduction = process.env.NODE_ENV === 'production';

/* =========================
   HELPERS
========================= */

const splitList = (value) =>
    (value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const hostOf = (url) => {
    try {
        return new URL(url).hostname;
    } catch (error) {
        return null;
    }
};

/* =========================
   DOMAINS
========================= */

const clientOrigins = splitList(
    process.env.CLIENT_DOMAIN
);

const dashboardOrigins = splitList(
    process.env.DASHBOARD_DOMAIN
);

const allowedOrigins = [
    ...clientOrigins,
    ...dashboardOrigins,

    // Local development frontend
    'http://127.0.0.1:5501',
    'http://localhost:5501',

    // Local backend
    'http://127.0.0.1:5000',
    'http://localhost:5000'
];

/* =========================
   EXPRESS SETTINGS
========================= */

app.set('trust proxy', 1);

/* =========================
   SECURITY
========================= */

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(compression());

/* =========================
   CORS
========================= */

app.use(
    cors({
        origin(origin, callback) {

            // Allow requests without Origin header
            if (!origin) {
                return callback(null, true);
            }

            // Allow approved origins
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.error(
                'CORS blocked origin:',
                origin
            );

            return callback(
                new Error('Not allowed by CORS')
            );
        },

        credentials: true
    })
);

/* =========================
   BODY PARSERS
========================= */

app.use(
    express.json({
        limit: '20kb'
    })
);

app.use(cookieParser());

/* =========================
   API RATE LIMITER
========================= */

app.use(
    '/api',
    apiLimiter
);

/* =========================
   API ROUTES
========================= */

app.use(
    '/api/contact',
    require('./routes/contactRoutes')
);

app.use(
    '/api/analytics',
    require('./routes/analyticsRoutes')
);

app.use(
    '/api/auth',
    require('./routes/authRoutes')
);

app.use(
    '/api/dashboard',
    require('./routes/dashboardRoutes')
);

/* =========================
   API 404
========================= */

app.use(
    '/api',
    (req, res) => {
        res.status(404).json({
            success: false,
            message: 'Not found.'
        });
    }
);

/* =========================
   DASHBOARD
========================= */

const dashboardHost = hostOf(
    dashboardOrigins[0]
);

const clientHost = hostOf(
    clientOrigins[0]
);

if (
    dashboardHost &&
    dashboardHost !== clientHost
) {
    app.use(
        (req, res, next) => {

            if (
                req.hostname === dashboardHost
            ) {
                return express.static(
                    dashboardDir
                )(req, res, next);
            }

            next();
        }
    );
}

/* =========================
   LOCAL DASHBOARD
========================= */

app.use(
    '/dashboard',
    express.static(dashboardDir)
);

/* =========================
   PUBLIC WEBSITE
========================= */

app.get(
    '/',
    (req, res) => {
        res.sendFile(
            path.join(
                publicDir,
                'teqvora.HTML'
            )
        );
    }
);

app.use(
    express.static(
        publicDir,
        {
            maxAge: isProduction
                ? '7d'
                : 0
        }
    )
);

/* =========================
   ERROR HANDLER
========================= */

app.use(
    errorHandler
);

/* =========================
   VERCEL / SERVERLESS
========================= */

let dbPromise;

async function ensureDB() {
    if (!dbPromise) {
        dbPromise = connectDB();
    }

    return dbPromise;
}

if (process.env.VERCEL) {

    module.exports = async (req, res) => {
        await ensureDB();
        return app(req, res);
    };

} else {

    /* =========================
       LOCAL DEVELOPMENT
    ========================= */

    const port = process.env.PORT || 5000;

    connectDB()
        .then(() => {

            app.listen(
                port,
                () => {

                    console.log(
                        `Server running on port ${port}`
                    );

                    console.log(
                        'Allowed CORS origins:'
                    );

                    allowedOrigins.forEach(
                        (origin) => {
                            console.log(
                                `- ${origin}`
                            );
                        }
                    );
                }
            );
        })
        .catch(
            (error) => {

                console.error(
                    'Startup failed:',
                    error.message
                );

                process.exit(1);
            }
        );
}
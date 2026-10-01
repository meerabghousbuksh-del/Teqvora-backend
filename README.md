# TEQVORA - Website + Backend + Dashboard

Stack: HTML / CSS / vanilla JS, Node.js, Express, MongoDB (Mongoose), Nodemailer, Chart.js.

## 1. Setup
1. Install Node.js 18+ from https://nodejs.org
2. `npm install`
3. Copy `.env.example` to `.env` and fill it in (see below).
4. `npm run create-admin` (asks name, email, password; the password is stored hashed)
5. `npm run dev`, then open:
   - Website: http://localhost:5000
   - Dashboard: http://localhost:5000/dashboard/login.html

## 2. MongoDB Atlas
Create a free cluster at https://cloud.mongodb.com > Database Access: add a user > Network Access: add your IP
(use 0.0.0.0/0 only if your host has no fixed IP) > Connect > Drivers > copy the string into `MONGO_URI`
and replace `<password>` and add a database name, e.g. `...mongodb.net/teqvora?retryWrites=true`.

## 3. Email (Gmail)
Turn on 2-Step Verification, create an App Password (Google Account > Security > App passwords),
put the 16 characters in `EMAIL_PASSWORD`, your address in `EMAIL_USER`, and the receiving address in `EMAIL_TO`.
If email fails, the inquiry is still saved in MongoDB and the error is logged.

## 4. Testing
- **Contact form:** submit the form on the site. Check the dashboard "Submissions" and your inbox.
- **Analytics:** open the site in a fresh tab, then check "Overview". Refreshing does not add another view;
  a new browser session or another page does.
- **Dashboard:** log in with the admin you created. Opening `/dashboard/index.html` while logged out redirects to login.

## 5. Production
Suggested domains: `example.com` (site), `api.example.com` (API), `dashboard.example.com` (dashboard).
Point all three DNS records to the same Node server (one process serves all of them), use HTTPS (Nginx/Caddy/host default) and set:

    NODE_ENV=production
    CLIENT_DOMAIN=https://example.com,https://www.example.com
    API_DOMAIN=https://api.example.com
    DASHBOARD_DOMAIN=https://dashboard.example.com
    COOKIE_DOMAIN=.example.com

Then set `window.API_BASE = 'https://api.example.com'` in **both** `public/js/config.js` and `dashboard/js/config.js`.
Requests to dashboard.example.com serve the `dashboard/` folder at its root.

## 6. Security notes
- Passwords: bcrypt. Login: 12h JWT in an HTTP-only, Secure (production), SameSite=Lax cookie.
- CORS only allows the origins in `CLIENT_DOMAIN` / `DASHBOARD_DOMAIN`.
- Rate limits: contact 5/hour, login 10/15 min, analytics 60/min, API 300/15 min (per IP).
- Visitor IPs are stored only as a salted SHA-256 hash.
- Helmet's Content-Security-Policy is disabled because the site uses CDN scripts; add one once hosts are final.
- Never commit `.env`. Rotate `JWT_SECRET` to log everyone out.

## 7. Notes
- `Visitor` = one row per page view. Unique visitors = distinct `visitorId`, sessions = distinct `sessionId`.
- Service names for validation live in `data/services.json` and must match the `<option>` texts in the form.
- The old `form.js` was removed: it looked for `#submitBtn` and `#responseMessage`, which do not exist in your form.

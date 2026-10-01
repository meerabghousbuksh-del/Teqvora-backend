// Every error ends up here. Details are logged, never sent to the browser.
function errorHandler(err, req, res, next) {
    console.error(err);

    const status = err.status || 500;
    const message = status < 500 ? err.message : 'Something went wrong.';

    res.status(status).json({ success: false, message });
}

// Lets route handlers use async/await without try/catch everywhere
function asyncHandler(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = { errorHandler, asyncHandler };

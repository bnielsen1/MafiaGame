// middleware/logger.js
function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.originalUrl}`);
  next(); // pass control to the next middleware/route
}

module.exports = requestLogger;

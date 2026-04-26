const jwt = require('jsonwebtoken');

// This function runs BEFORE protected routes
// It checks if the user is logged in
const protect = (req, res, next) => {
  try {
    // Get token from request header
    // Frontend sends it as: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request so next function can use it
    req.user = decoded;

    next(); // move on to the actual route

  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

module.exports = { protect, adminOnly };
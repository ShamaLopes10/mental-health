// middleware/authMiddleware.js
const passport = require('passport');

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('JWT Auth Error:', err);
      return res.status(500).json({ msg: 'Server error during authentication.' });
    }

    if (!user) {
      console.log('JWT Auth Info:', info); // useful for debugging expired/invalid token
      return res.status(401).json({ msg: 'Unauthorized: Access is denied due to invalid credentials.' });
    }

    // Attach user to request object
    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = authMiddleware;

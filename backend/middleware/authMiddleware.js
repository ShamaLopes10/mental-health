// middleware/authMiddleware.js
const passport = require('passport');

module.exports = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err || !user) {
      // console.log('JWT Auth Error:', info); // Log specific JWT error
      return res.status(401).json({ msg: 'Unauthorized: Access is denied due to invalid credentials.' });
    }
    req.user = user; // Attach user to request object
    return next();
  })(req, res, next);
};
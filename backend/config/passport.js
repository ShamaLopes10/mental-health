// config/passport.js
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const db = require('../models');
const User = db.User;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // expects Bearer token
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findByPk(jwt_payload.id, {
          attributes: ['id', 'username', 'email'], // select only required fields
        });
        if (user) return done(null, user);
        return done(null, false); // user not found
      } catch (err) {
        console.error('JWT Strategy Error:', err);
        return done(err, false);
      }
    })
  );
};

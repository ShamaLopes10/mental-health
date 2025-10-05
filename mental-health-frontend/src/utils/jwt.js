// utils/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  // Include only necessary info in payload
  const payload = { id: user.id, username: user.username, email: user.email };

  // Sign token with secret and expiration
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = generateToken;

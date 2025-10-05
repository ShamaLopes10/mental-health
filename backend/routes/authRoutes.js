// mindscribe-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../models');
const { User, UserProfile, sequelize } = db;

// Utility to generate token
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

// =================== REGISTER ===================
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    const t = await sequelize.transaction(); // transaction start
    try {
      // Check uniqueness
      const existing = await User.findOne({ where: { email }, transaction: t });
      if (existing) {
        await t.rollback();
        return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
      }

      const existingUsername = await User.findOne({ where: { username }, transaction: t });
      if (existingUsername) {
        await t.rollback();
        return res.status(400).json({ errors: [{ msg: 'Username already taken' }] });
      }

      // Create user
      const newUser = await User.create({ username, email, password }, { transaction: t });

      // Create profile
      await UserProfile.create({ userId: newUser.id }, { transaction: t });

      await t.commit();

      const token = generateToken({ id: newUser.id, username: newUser.username });
      res.status(201).json({
        token,
        user: { id: newUser.id, username: newUser.username, email: newUser.email },
      });
    } catch (err) {
      await t.rollback();
      console.error('[REGISTER ERROR]', err);
      res.status(500).json({ errors: [{ msg: 'Server error during registration' }] });
    }
  }
);

// =================== LOGIN ===================
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });

      const isMatch = await user.isValidPassword(password);
      if (!isMatch) return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });

      // Ensure profile exists
      const profile = await UserProfile.findOne({ where: { userId: user.id } });
      if (!profile) {
        await UserProfile.create({ userId: user.id });
      }

      const token = generateToken({ id: user.id, username: user.username });
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      res.status(500).json({ errors: [{ msg: 'Server error during login' }] });
    }
  }
);

module.exports = router;

// mindscribe-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models'); // This now includes User, UserProfile, etc.
const User = db.User;
const UserProfile = db.UserProfile; // Make sure UserProfile model is included in db object from models/index.js

// @route   POST api/auth/register
// @desc    Register user and create an associated UserProfile
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation for incoming data
  if (!username || !email || !password) {
    return res.status(400).json({ errors: [{ msg: 'Please enter all fields: username, email, and password' }] });
  }
  // Add more specific validation if needed (e.g., password length, email format - though Sequelize model might handle some)

  try {
    // Check if email already exists
    let userByEmail = await User.findOne({ where: { email } });
    if (userByEmail) {
      return res.status(400).json({ errors: [{ msg: 'User already exists with this email' }] });
    }

    // Check if username already exists
    let userByUsername = await User.findOne({ where: { username } });
    if (userByUsername) {
      return res.status(400).json({ errors: [{ msg: 'Username already taken' }] });
    }

    // Create new user
    // The password hashing is handled by the beforeCreate hook in the User model
    const newUser = await User.create({
      username,
      email,
      password
      // role: 'user' // If you have a role field, set default here or in model
    });

    // **** NEW: Create an associated UserProfile with default values ****
    try {
        await UserProfile.create({
            userId: newUser.id,
            // areas_of_concern and preferred_content_types will use their model defaults (empty arrays)
        });
        console.log(`[POST /api/auth/register] Successfully created UserProfile for userId: ${newUser.id}`);
    } catch (profileError) {
        // This is a critical secondary error. Log it, but still try to return token for the user.
        // The user can create/update their profile later.
        // Or, you might decide this is a fatal error and rollback user creation (more complex with transactions).
        console.error(`[POST /api/auth/register] Failed to create UserProfile for userId: ${newUser.id}`, profileError.message, profileError.stack);
        // Optionally, you could delete the user if profile creation is mandatory for login:
        // await newUser.destroy();
        // return res.status(500).json({ errors: [{ msg: 'User registered but profile creation failed. Please contact support.'}]});
    }

    // Create JWT Payload
    const payload = {
      id: newUser.id,
      username: newUser.username
      // role: newUser.role // Include role in JWT if you have roles
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Make sure JWT_SECRET is in your .env file
      { expiresIn: '1h' },   // Or your preferred expiration (e.g., '7d')
      (err, token) => {
        if (err) {
            console.error('[POST /api/auth/register] Error signing token:', err);
            // Don't throw here directly, as it might not be caught by the outer try-catch for res.status(500)
            // Instead, send a 500 error response.
            return res.status(500).json({ errors: [{ msg: 'Error generating authentication token.' }] });
        }
        console.log(`[POST /api/auth/register] User ${newUser.username} registered successfully. Token generated.`);
        res.status(201).json({ // Send 201 Created for successful registration
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
                // role: newUser.role
            }
        });
      }
    );

  } catch (err) {
    console.error('[POST /api/auth/register] Overall Server Error:', err.message, err.stack);
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message, path: e.path })) });
    }
    res.status(500).send('Server error during registration');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ errors: [{ msg: 'Please provide both email and password' }] });
  }

  try {
    const user = await User.findOne({
        where: { email },
        // Optionally include profile if needed immediately on login for frontend state
        // include: [{ model: db.UserProfile, as: 'profile' }]
    });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // isValidPassword should be an instance method on your User model
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Ensure profile exists, create if not (defensive, in case registration didn't create one)
    let profile = await UserProfile.findOne({ where: { userId: user.id }});
    if (!profile) {
        console.warn(`[POST /api/auth/login] No profile found for userId: ${user.id} during login. Creating one.`);
        try {
            await UserProfile.create({ userId: user.id });
        } catch (profileCreationError) {
            console.error(`[POST /api/auth/login] Failed to create missing UserProfile for userId: ${user.id}`, profileCreationError.message);
            // Continue with login, profile can be fetched/updated later
        }
    }


    const payload = {
      id: user.id,
      username: user.username
      // role: user.role // Include role in JWT if you have roles
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
            console.error('[POST /api/auth/login] Error signing token:', err);
            return res.status(500).json({ errors: [{ msg: 'Error generating authentication token.' }] });
        }
        console.log(`[POST /api/auth/login] User ${user.username} logged in successfully. Token generated.`);
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                // role: user.role,
                // profile: user.profile // If you included profile in the User.findOne query
            }
        });
      }
    );
  } catch (err) {
    console.error('[POST /api/auth/login] Overall Server Error:', err.message, err.stack);
    res.status(500).send('Server error during login');
  }
});

module.exports = router;
// mindscribe-backend/routes/userProfileRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../models');
const UserProfile = db.UserProfile;
const User = db.User; // Needed if creating profile on demand

// @route   GET api/profile
// @desc    Get current user's profile (creates if not exists)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        let profile = await UserProfile.findOne({
            where: { userId },
            // include: [{ model: User, as: 'user', attributes: ['username', 'email'] }] // Optionally include user details
        });

        if (!profile) {
            // If no profile exists, create a default one
            console.log(`[GET /api/profile] No profile found for userId: ${userId}. Creating one.`);
            profile = await UserProfile.create({
                userId,
                areas_of_concern: [],
                preferred_content_types: []
            });
        }
        res.json(profile);
    } catch (err) {
        console.error('[GET /api/profile] Error:', err.message, err.stack);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile
// @desc    Update current user's profile
// @access  Private
router.put('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { areas_of_concern, preferred_content_types } = req.body;

    // Basic validation for input types
    if (areas_of_concern !== undefined && !Array.isArray(areas_of_concern)) {
        return res.status(400).json({ msg: 'areas_of_concern must be an array of strings' });
    }
    if (preferred_content_types !== undefined && !Array.isArray(preferred_content_types)) {
        return res.status(400).json({ msg: 'preferred_content_types must be an array of strings' });
    }

    try {
        let profile = await UserProfile.findOne({ where: { userId } });

        if (!profile) {
            // Should ideally not happen if GET /profile creates it, but as a fallback:
            profile = await UserProfile.create({
                userId,
                areas_of_concern: areas_of_concern || [],
                preferred_content_types: preferred_content_types || []
            });
        } else {
            // Update fields if they are provided in the request body
            if (areas_of_concern !== undefined) {
                profile.areas_of_concern = areas_of_concern.map(item => String(item).trim().toLowerCase());
            }
            if (preferred_content_types !== undefined) {
                profile.preferred_content_types = preferred_content_types.map(item => String(item).trim().toLowerCase());
            }
            await profile.save();
        }
        res.json(profile);
    } catch (err) {
        console.error('[PUT /api/profile] Error:', err.message, err.stack);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message })) });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
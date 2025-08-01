const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Your JWT auth middleware
const db = require('../models');
const MoodLog = db.MoodLog;

// @route   POST api/moodlogs
// @desc    Create a new mood log for the logged-in user
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    const { moodRating, symptoms, triggers, notes, loggedAt } = req.body;
    const userId = req.user.id; // From JWT payload via authMiddleware

    if (moodRating === undefined || moodRating === null) {
        return res.status(400).json({ errors: [{ msg: 'Mood rating is required' }] });
    }
    if (typeof moodRating !== 'number' || moodRating < 1 || moodRating > 5) { // Adjust range as needed
        return res.status(400).json({ errors: [{ msg: 'Mood rating must be a number between 1 and 5' }] });
    }

    // Validate symptoms and triggers if they are provided (should be arrays of strings)
    if (symptoms && !Array.isArray(symptoms)) {
        return res.status(400).json({ errors: [{ msg: 'Symptoms must be an array of strings' }] });
    }
    if (triggers && !Array.isArray(triggers)) {
        return res.status(400).json({ errors: [{ msg: 'Triggers must be an array of strings' }] });
    }

    try {
        const newMoodLog = await MoodLog.create({
            userId,
            moodRating,
            symptoms: symptoms || [], // Default to empty array if not provided
            triggers: triggers || [], // Default to empty array
            notes,
            loggedAt: loggedAt ? new Date(loggedAt) : new Date() // Use provided or current time
        });
        res.status(201).json(newMoodLog);
    } catch (err) {
        console.error('[POST /api/moodlogs] Error:', err.message, err.errors);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message, path: e.path })) });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/moodlogs
// @desc    Get all mood logs for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const moodLogs = await MoodLog.findAll({
            where: { userId },
            order: [['loggedAt', 'DESC'], ['createdAt', 'DESC']] // Show newest logs first
        });
        res.json(moodLogs);
    } catch (err) {
        console.error('[GET /api/moodlogs] Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// Optional: Get a single mood log by ID (if needed for editing/viewing details)
// router.get('/:id', authMiddleware, async (req, res) => { /* ... */ });

// Optional: Update a mood log (if users can edit past logs)
// router.put('/:id', authMiddleware, async (req, res) => { /* ... */ });

// Optional: Delete a mood log
// router.delete('/:id', authMiddleware, async (req, res) => { /* ... */ });

module.exports = router;
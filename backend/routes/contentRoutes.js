const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Your JWT auth middleware
const db = require('../models');
const { ContentItem } = db; // Or const ContentItem = db.ContentItem;
const { Op } = require('sequelize'); // For Sequelize operators like 'overlap'

// @route   GET api/content
// @desc    Get all content items, optionally filtered by tags or type
// @access  Private (User must be logged in)
router.get('/', authMiddleware, async (req, res) => {
    const { tags, type, search } = req.query; // e.g., /api/content?tags=anxiety,mindfulness&type=article&search=breathing
    let whereClause = {};

    if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
        // For ARRAY type in PostgreSQL with Sequelize:
        // Op.overlap checks if any of the provided tags are in the content item's tags array
        whereClause.tags = { [Op.overlap]: tagList };
    }
    if (type) {
        whereClause.contentType = type;
    }
    if (search) {
        // Basic search on title and body (can be improved with full-text search later)
        whereClause[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } }, // iLike for case-insensitive search
            { body: { [Op.iLike]: `%${search}%` } }
        ];
    }

    try {
        const contentItems = await ContentItem.findAll({
            where: whereClause,
            order: [['updatedAt', 'DESC']] // Show most recently updated/created first
        });
        res.json(contentItems);
    } catch (err) {
        console.error('[GET /api/content] Error:', err.message, err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/content/:id
// @desc    Get a single content item by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const item = await ContentItem.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: 'Content item not found' });
        }
        res.json(item);
    } catch (err) {
        console.error(`[GET /api/content/${req.params.id}] Error:`, err.message);
        res.status(500).send('Server Error');
    }
});

// --- Admin Routes (Consider adding specific admin role check middleware later) ---

// @route   POST api/content
// @desc    Create a new content item (Admin only)
// @access  Private (Should be Admin)
router.post('/', authMiddleware, /* isAdminMiddleware, */ async (req, res) => {
    // Example: basic admin check (replace with proper role-based auth)
    // if (req.user.role !== 'admin') {
    //     return res.status(403).json({ msg: 'Forbidden: Admin access required' });
    // }

    const { title, contentType, body, url, tags, source, estimatedTimeMinutes, difficulty } = req.body;

    // Basic Validations
    if (!title || !contentType) {
        return res.status(400).json({ errors: [{ msg: 'Title and content type are required' }] });
    }
    if (contentType === 'video' && (!url || url.trim() === '')) {
        return res.status(400).json({ errors: [{ msg: 'URL is required for video content' }] });
    }
    if ((contentType === 'article' || contentType === 'exercise') && (!body || body.trim() === '')) {
        return res.status(400).json({ errors: [{ msg: 'Body is required for articles and exercises' }] });
    }
    if (tags && !Array.isArray(tags)) {
         return res.status(400).json({ errors: [{ msg: 'Tags should be an array of strings'}] });
    }


    try {
        const newContentItem = await ContentItem.create({
            title,
            contentType,
            body: (contentType === 'article' || contentType === 'exercise') ? body : null,
            url: contentType === 'video' ? url : null,
            tags: tags ? tags.map(tag => tag.trim().toLowerCase()) : [], // Normalize tags
            source,
            estimatedTimeMinutes,
            difficulty
        });
        res.status(201).json(newContentItem);
    } catch (err) {
        console.error('[POST /api/content] Error:', err.message, err.errors);
        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message, path: e.path })) });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/content/:id
// @desc    Update a content item (Admin only)
// @access  Private (Should be Admin)
router.put('/:id', authMiddleware, /* isAdminMiddleware, */ async (req, res) => {
    // if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });

    const { title, contentType, body, url, tags, source, estimatedTimeMinutes, difficulty } = req.body;
    const contentId = req.params.id;

    try {
        const item = await ContentItem.findByPk(contentId);
        if (!item) {
            return res.status(404).json({ msg: 'Content item not found' });
        }

        // Update fields selectively
        if (title) item.title = title;
        if (contentType) item.contentType = contentType;
        // Handle body/url based on contentType
        if (contentType === 'video'){
            if (url) item.url = url;
            item.body = null; // Clear body if it's now a video
        } else if (contentType === 'article' || contentType === 'exercise') {
            if (body) item.body = body;
            item.url = null; // Clear URL if it's now an article/exercise
        }
        // Also allow updating body/url independently if contentType is not changed
        else {
            if (body !== undefined) item.body = body;
            if (url !== undefined) item.url = url;
        }

        if (tags) item.tags = Array.isArray(tags) ? tags.map(tag => tag.trim().toLowerCase()) : [];
        if (source !== undefined) item.source = source; // Allow setting source to empty string
        if (estimatedTimeMinutes !== undefined) item.estimatedTimeMinutes = estimatedTimeMinutes;
        if (difficulty !== undefined) item.difficulty = difficulty;


        await item.save();
        res.json(item);
    } catch (err) {
        console.error(`[PUT /api/content/${contentId}] Error:`, err.message);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message, path: e.path })) });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/content/:id
// @desc    Delete a content item (Admin only)
// @access  Private (Should be Admin)
router.delete('/:id', authMiddleware, /* isAdminMiddleware, */ async (req, res) => {
    // if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
    const contentId = req.params.id;
    try {
        const item = await ContentItem.findByPk(contentId);
        if (!item) {
            return res.status(404).json({ msg: 'Content item not found' });
        }
        await item.destroy();
        res.json({ msg: 'Content item removed successfully' });
    } catch (err) {
        console.error(`[DELETE /api/content/${contentId}] Error:`, err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/:contentItemId/interactions', authMiddleware, async (req, res) => {
    const { contentItemId } = req.params;
    const userId = req.user.id;
    const { rating, isHelpful, feedbackText, viewed } = req.body; // 'viewed' is a flag to log a view

    try {
        const contentItem = await db.ContentItem.findByPk(contentItemId);
        if (!contentItem) {
            return res.status(404).json({ msg: 'Content item not found' });
        }

        let interaction = await db.UserContentInteraction.findOne({
            where: { userId, contentItemId }
        });

        const updateData = { viewedAt: new Date() }; // Always update viewedAt on any interaction

        if (rating !== undefined) updateData.rating = parseInt(rating);
        if (isHelpful !== undefined) updateData.isHelpful = Boolean(isHelpful);
        if (feedbackText !== undefined) updateData.feedbackText = feedbackText;


        if (interaction) {
            // Update existing interaction
            await interaction.update(updateData);
        } else {
            // Create new interaction
            interaction = await db.UserContentInteraction.create({
                userId,
                contentItemId,
                ...updateData
            });
        }
        res.json(interaction);
    } catch (err) {
        console.error(`[POST /api/content/${contentItemId}/interactions] Error:`, err.message, err.stack);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => ({ msg: e.message })) });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/content/:contentItemId/interactions/me
// @desc    Get the current user's interaction for a specific content item
// @access  Private
router.get('/:contentItemId/interactions/me', authMiddleware, async (req, res) => {
    const { contentItemId } = req.params;
    const userId = req.user.id;
    try {
        const interaction = await db.UserContentInteraction.findOne({
            where: { userId, contentItemId }
        });
        if (!interaction) {
            // Return a default or empty state if no interaction yet,
            // so frontend doesn't error out trying to access properties of null.
            return res.json({ rating: null, isHelpful: null, feedbackText: '' });
        }
        res.json(interaction);
    } catch (err) {
        console.error(`[GET /api/content/${contentItemId}/interactions/me] Error:`, err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
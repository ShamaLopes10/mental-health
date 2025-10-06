const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../models');
const { MoodLog, UserProfile, ContentItem, UserContentInteraction } = db;
const { Op } = require('sequelize');

async function getTagsForContentItems(itemIds) {
    if (!itemIds || itemIds.length === 0) return [];
    const itemsWithTags = await ContentItem.findAll({
        where: { id: { [Op.in]: itemIds } },
        attributes: ['tags']
    });
    let allTags = new Set();
    itemsWithTags.forEach(item => {
        if (item.tags) {
            item.tags.forEach(tag => allTags.add(tag.toLowerCase().trim()));
        }
    });
    return Array.from(allTags);
}

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const MAX_RECOMMENDATIONS = 5;
        const RECENTLY_VIEWED_LIMIT = 20;
        const EXCLUDE_VIEWED_COUNT = 10;

        const userProfile = await UserProfile.findOne({ where: { userId } });
        const latestMoodLog = await MoodLog.findOne({
            where: { userId },
            order: [['loggedAt', 'DESC']],
        });

        let interestTags = new Set();
        if (userProfile?.areas_of_concern) {
            userProfile.areas_of_concern.forEach(t => interestTags.add(t.toLowerCase().trim()));
        }
        if (latestMoodLog?.symptoms) {
            latestMoodLog.symptoms.forEach(t => interestTags.add(t.toLowerCase().trim()));
        }
        const preferredContentTypes = userProfile?.preferred_content_types || [];

        const recentInteractions = await UserContentInteraction.findAll({
            where: { userId },
            order: [['viewedAt', 'DESC']],
            limit: RECENTLY_VIEWED_LIMIT,
        });

        const viewedItemIds = recentInteractions.map(i => i.contentItemId);
        const helpfulItemIds = recentInteractions
            .filter(i => i.isHelpful === true)
            .map(i => i.contentItemId);

        let candidateQueryOptions = {
            where: {},
            order: [['updatedAt', 'DESC']],
            limit: 50
        };

        if (interestTags.size > 0) {
            candidateQueryOptions.where.tags = { [Op.overlap]: Array.from(interestTags) };
        }

        if (viewedItemIds.length > 0) {
            candidateQueryOptions.where.id = { [Op.notIn]: viewedItemIds.slice(0, EXCLUDE_VIEWED_COUNT) };
        }

        let candidates = await ContentItem.findAll(candidateQueryOptions);

        let scoredCandidates = candidates.map(item => {
            let score = 0;
            const itemTagsLower = item.tags ? item.tags.map(t => t.toLowerCase().trim()) : [];
            if (interestTags.size > 0 && itemTagsLower.length > 0) {
                const matches = itemTagsLower.filter(tag => interestTags.has(tag));
                score += matches.length * 10;
            }
            if (preferredContentTypes.length > 0 && preferredContentTypes.includes(item.contentType)) {
                score += 5;
            }
            if (!item.difficulty || item.difficulty === 'easy' || item.difficulty === 'medium') {
                score += 1;
            }
            return { ...item.get({ plain: true }), score };
        });

        if (interestTags.size > 0) {
            scoredCandidates = scoredCandidates.filter(item => item.score > 0);
        }

        scoredCandidates.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        const finalRecommendations = scoredCandidates.slice(0, MAX_RECOMMENDATIONS);

        let reasonParts = [];
        if (interestTags.size > 0) reasonParts.push("your interests/mood");
        if (preferredContentTypes.length > 0) reasonParts.push("content type preferences");

        let reasonMessage = "Here are some suggestions we think you'll find useful.";
        if (reasonParts.length > 0) {
            reasonMessage = `Based on ${reasonParts.join(' and ')}.`;
        }
        if (finalRecommendations.length === 0 && candidates.length > 0 && interestTags.size > 0) {
            reasonMessage = "We couldn't find specific matches for all your preferences, but here are some general suggestions.";
        }

        res.json({
            recommendations: finalRecommendations,
            reason: reasonMessage
        });

    } catch (err) {
        console.error('[GET /api/recommendations] Error:', err.message, err.stack);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

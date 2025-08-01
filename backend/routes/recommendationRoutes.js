// mindscribe-backend/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const db = require('../models');
const { MoodLog, UserProfile, ContentItem, UserContentInteraction } = db; // Added UserContentInteraction
const { Op } = require('sequelize');

// Helper function to get tags from a content item (if needed for boosting similar)
// This would be more efficient if tags were directly on helpful items from a join
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


// @route   GET /
// @desc    Get personalized content recommendations for the logged-in user
// @access  Private
// (Assuming this file is mounted at /api/recommendations in server.js)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const MAX_RECOMMENDATIONS = 5;
        const RECENTLY_VIEWED_LIMIT = 20; // Consider last 20 viewed items to exclude a portion
        const EXCLUDE_VIEWED_COUNT = 10; // Exclude the very last 10 viewed from recommendations

        // 1. Fetch user profile and latest mood log
        
        const userProfile = await UserProfile.findOne({ where: { userId } });
        const latestMoodLog = await MoodLog.findOne({
            where: { userId },
            order: [['loggedAt', 'DESC']],
        });

        // 2. Gather user's interest tags and preferences
        let interestTags = new Set();
        if (userProfile?.areas_of_concern) {
            userProfile.areas_of_concern.forEach(t => interestTags.add(t.toLowerCase().trim()));
        }
        if (latestMoodLog?.symptoms) {
            latestMoodLog.symptoms.forEach(t => interestTags.add(t.toLowerCase().trim()));
        }
        const preferredContentTypes = userProfile?.preferred_content_types || [];

        // 3. Fetch user's recent interactions
        const recentInteractions = await UserContentInteraction.findAll({
            where: { userId },
            order: [['viewedAt', 'DESC']], // Most recent first
            limit: RECENTLY_VIEWED_LIMIT,
            // attributes: ['contentItemId', 'isHelpful', 'rating'], // Only fetch needed attributes
        });

        const viewedItemIds = recentInteractions.map(i => i.contentItemId);
        const helpfulItemIds = recentInteractions
            .filter(i => i.isHelpful === true) // Consider items explicitly marked helpful
            .map(i => i.contentItemId);

        // Optional: Get tags from helpful items to boost similar content
        // let boostedTags = new Set();
        // if (helpfulItemIds.length > 0) {
        //     const tagsFromHelpful = await getTagsForContentItems(helpfulItemIds);
        //     tagsFromHelpful.forEach(tag => boostedTags.add(tag));
        // }


        // 4. Construct query for candidate content items
        let candidateQueryOptions = {
            where: {},
            order: [['updatedAt', 'DESC']], // Default sort
            limit: 50 // Fetch a larger pool of candidates
        };

        // Filter by interest tags if present
        if (interestTags.size > 0) {
            candidateQueryOptions.where.tags = { [Op.overlap]: Array.from(interestTags) };
        }

        // Exclude recently viewed items
        if (viewedItemIds.length > 0) {
            candidateQueryOptions.where.id = { [Op.notIn]: viewedItemIds.slice(0, EXCLUDE_VIEWED_COUNT) };
        }

        let candidates = await ContentItem.findAll(candidateQueryOptions);

        // 5. Score and Rank Candidates
        let scoredCandidates = candidates.map(item => {
            let score = 0;
            const itemTagsLower = item.tags ? item.tags.map(t => t.toLowerCase().trim()) : [];

            // A. Score based on matching interest tags
            if (interestTags.size > 0 && itemTagsLower.length > 0) {
                const matches = itemTagsLower.filter(tag => interestTags.has(tag));
                score += matches.length * 10; // Higher weight for more tag matches
            }

            // B. Score based on preferred content type
            if (preferredContentTypes.length > 0 && preferredContentTypes.includes(item.contentType)) {
                score += 5;
            }

            // C. Slight boost for difficulty matching 'easy' or 'medium' if not specified (general audience)
            if (!item.difficulty || item.difficulty === 'easy' || item.difficulty === 'medium') {
                score += 1;
            }

            // D. TODO: Boost based on similarity to "helpful" items (e.g., shared tags with helpfulItemIds' content)
            // if (boostedTags.size > 0 && itemTagsLower.length > 0) {
            //    const boostedMatches = itemTagsLower.filter(tag => boostedTags.has(tag));
            //    score += boostedMatches.length * 3; // Lower weight than direct interest
            // }


            // E. Recency (newer content gets a slight implicit advantage if scores are equal due to initial sort)
            // You could add a small score based on how recent item.updatedAt is.
            // For example:
            // const daysOld = (new Date() - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24);
            // if (daysOld < 30) score += 2; else if (daysOld < 90) score +=1;


            return { ...item.get({ plain: true }), score }; // Use .get({ plain: true }) for Sequelize instances
        });

        // Filter out items with zero score if we had specific interest tags (means no match at all)
        if (interestTags.size > 0) {
            scoredCandidates = scoredCandidates.filter(item => item.score > 0);
        }

        // Sort by score descending, then by updatedAt for tie-breaking
        scoredCandidates.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        const finalRecommendations = scoredCandidates.slice(0, MAX_RECOMMENDATIONS);

        // Construct a more dynamic reason message
        let reasonParts = [];
        if (interestTags.size > 0) reasonParts.push("your interests/mood");
        if (preferredContentTypes.length > 0) reasonParts.push("content type preferences");

        let reasonMessage = "Here are some suggestions we think you'll find useful.";
        if (reasonParts.length > 0) {
            reasonMessage = `Based on ${reasonParts.join(' and ')}.`;
        }
        if (finalRecommendations.length === 0 && candidates.length > 0 && interestTags.size > 0) {
            // If filters were too strict, maybe fall back to more general content
            // For now, just indicate why no specific recommendations
            reasonMessage = "We couldn't find specific matches for all your preferences, but here are some general suggestions.";
            // Potentially re-query without tag filters or show most popular if no matches
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
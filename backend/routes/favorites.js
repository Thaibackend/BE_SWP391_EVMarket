const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

// All favorite routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Get user favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User favorites
 *       401:
 *         description: Unauthorized
 */
router.get('/', FavoriteController.getUserFavorites);

/**
 * @swagger
 * /api/favorites/count:
 *   get:
 *     tags: [Favorites]
 *     summary: Get favorite count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite count
 *       401:
 *         description: Unauthorized
 */
router.get('/count', FavoriteController.getFavoriteCount);

/**
 * @swagger
 * /api/favorites/{listingId}/check:
 *   get:
 *     tags: [Favorites]
 *     summary: Check if listing is favorited
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Favorite status
 *       401:
 *         description: Unauthorized
 */
router.get('/:listingId/check', FavoriteController.checkFavorite);

/**
 * @swagger
 * /api/favorites/{listingId}:
 *   post:
 *     tags: [Favorites]
 *     summary: Add listing to favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Added to favorites
 *       401:
 *         description: Unauthorized
 */
router.post('/:listingId', FavoriteController.addToFavorites);

/**
 * @swagger
 * /api/favorites/{listingId}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove listing from favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Removed from favorites
 *       401:
 *         description: Unauthorized
 */
router.delete('/:listingId', FavoriteController.removeFromFavorites);

/**
 * @swagger
 * /api/favorites/id/{favoriteId}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove favorite by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Favorite removed
 *       401:
 *         description: Unauthorized
 */
router.delete('/id/:favoriteId', FavoriteController.removeFavoriteById);

module.exports = router;

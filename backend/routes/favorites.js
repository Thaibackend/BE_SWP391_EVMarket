const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

// All favorite routes require authentication
router.use(authenticateToken);

// Favorite management
router.get('/', FavoriteController.getUserFavorites);
router.get('/count', FavoriteController.getFavoriteCount);
router.get('/:listingId/check', FavoriteController.checkFavorite);
router.post('/:listingId', FavoriteController.addToFavorites);
router.delete('/:listingId', FavoriteController.removeFromFavorites);
router.delete('/id/:favoriteId', FavoriteController.removeFavoriteById);

module.exports = router;

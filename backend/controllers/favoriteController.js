const FavoriteListing = require('../models/FavoriteListing');
const { authenticateToken } = require('../middleware/auth');

class FavoriteController {
    // Get user's favorite listings (Protected)
    static async getUserFavorites(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const userId = req.user.userId;

            const favorites = await FavoriteListing.getByUserId(userId, pageNum, limitNum);

            res.json({
                success: true,
                data: {
                    favorites,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(favorites.length / limitNum),
                        totalItems: favorites.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get user favorites error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get favorite listings',
                error: error.message
            });
        }
    }

    // Add listing to favorites (Protected)
    static async addToFavorites(req, res) {
        try {
            const { listingId } = req.params;
            const userId = req.user.userId;

            // Check if already in favorites
            const isAlreadyFavorite = await FavoriteListing.checkFavorite(userId, parseInt(listingId));
            if (isAlreadyFavorite) {
                return res.status(400).json({
                    success: false,
                    message: 'Listing is already in your favorites'
                });
            }

            const favoriteData = {
                userId,
                listingId: parseInt(listingId)
            };

            const favorite = await FavoriteListing.create(favoriteData);

            res.status(201).json({
                success: true,
                message: 'Listing added to favorites',
                data: favorite
            });
        } catch (error) {
            console.error('Add to favorites error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add listing to favorites',
                error: error.message
            });
        }
    }

    // Remove listing from favorites (Protected)
    static async removeFromFavorites(req, res) {
        try {
            const { listingId } = req.params;
            const userId = req.user.userId;

            const removed = await FavoriteListing.remove(userId, parseInt(listingId));

            if (removed) {
                res.json({
                    success: true,
                    message: 'Listing removed from favorites'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Listing not found in your favorites'
                });
            }
        } catch (error) {
            console.error('Remove from favorites error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove listing from favorites',
                error: error.message
            });
        }
    }

    // Check if listing is in favorites (Protected)
    static async checkFavorite(req, res) {
        try {
            const { listingId } = req.params;
            const userId = req.user.userId;

            const isFavorite = await FavoriteListing.checkFavorite(userId, parseInt(listingId));

            res.json({
                success: true,
                data: { isFavorite }
            });
        } catch (error) {
            console.error('Check favorite error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check favorite status',
                error: error.message
            });
        }
    }

    // Get favorite count (Protected)
    static async getFavoriteCount(req, res) {
        try {
            const userId = req.user.userId;
            const totalCount = await FavoriteListing.getTotalCount(userId);

            res.json({
                success: true,
                data: { totalCount }
            });
        } catch (error) {
            console.error('Get favorite count error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get favorite count',
                error: error.message
            });
        }
    }

    // Remove favorite by ID (Protected)
    static async removeFavoriteById(req, res) {
        try {
            const { favoriteId } = req.params;
            const userId = req.user.userId;

            // Verify favorite belongs to user
            const userFavorites = await FavoriteListing.getByUserId(userId);
            const targetFavorite = userFavorites.find(f => f.favoriteId === parseInt(favoriteId));

            if (!targetFavorite) {
                return res.status(404).json({
                    success: false,
                    message: 'Favorite not found or you do not have permission to remove it'
                });
            }

            const removed = await FavoriteListing.removeById(parseInt(favoriteId));

            if (removed) {
                res.json({
                    success: true,
                    message: 'Favorite removed successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to remove favorite'
                });
            }
        } catch (error) {
            console.error('Remove favorite by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove favorite',
                error: error.message
            });
        }
    }
}

module.exports = FavoriteController;

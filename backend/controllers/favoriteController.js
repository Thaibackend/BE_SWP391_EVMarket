const favoriteService = require("../services/favoriteListingService");

exports.toggleFavorite = async (req, res) => {
  try {
    const { userId, listingId } = req.body;
    const result = await favoriteService.toggleFavorite(userId, listingId);
    res.json({
      success: true,
      message: result.added ? "Added to favorites" : "Removed from favorites",
      favorite: result.favorite,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

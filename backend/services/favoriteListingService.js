const Favorite = require("../models/FavoriteListing");

class FavoriteListingService {
  async toggleFavorite(userId, listingId) {
    let favorite = await Favorite.findOne({ user: userId });

    if (!favorite) {
      favorite = await Favorite.create({
        user: userId,
        listings: [listingId],
      });
      return { added: true, favorite };
    }

    const index = favorite.listings.indexOf(listingId);

    if (index === -1) {
      favorite.listings.push(listingId);
      await favorite.save();
      return { added: true, favorite };
    } else {
      favorite.listings.splice(index, 1);
      await favorite.save();
      return { added: false, favorite };
    }
  }
}

module.exports = new FavoriteListingService();

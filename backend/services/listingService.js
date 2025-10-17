const Listing = require("../models/Listing");

class ListingService {
  async createListing(data) {
    return await Listing.create(data);
  }
}

module.exports = new ListingService();

const Listing = require("../models/Listing");

class ListingService {
  async createListing(data) {
    return await Listing.create(data);
  }
  async getListingById(id) {
    return await Listing.findById(id).populate("seller brand model");
  }

  async getAllListings(filters) {
    const query = {};

    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.brand) query.brand = filters.brand;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    return await Listing.find(query).populate("seller brand model");
  }

  async getListingsBySeller(sellerId) {
    return await Listing.find({ seller: sellerId }).populate("brand model");
  }

  async updateListing(id, data) {
    return await Listing.findByIdAndUpdate(id, data, { new: true });
  }

  async updateStatus(id, status) {
    return await Listing.findByIdAndUpdate(id, { status }, { new: true });
  }
}

module.exports = new ListingService();

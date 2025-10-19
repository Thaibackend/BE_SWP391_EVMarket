const Listing = require("../models/Listing");

class ListingService {
  async createListing(data) {
    return await Listing.create(data);
  }
  async getListingById(id) {
    return await Listing.findById(id).populate("seller brand");
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

    return await Listing.find(query).populate("seller brand");
  }

  async getListingsBySeller(sellerId) {
    return await Listing.find({ seller: sellerId }).populate("brand");
  }

  async updateListing(id, data) {
    return await Listing.findByIdAndUpdate(id, data, { new: true });
  }

  async updateStatus(id, status) {
    return await Listing.findByIdAndUpdate(id, { status }, { new: true });
  }

  async deleteListing(id) {
    return await Listing.findByIdAndDelete(id);
  }

  async getListingsByType(type) {
    const query = {};
    if (type) query.type = type;

    return await Listing.find(query)
      .populate("seller", "name email")
      .populate("brand", "name");
  }
}

module.exports = new ListingService();

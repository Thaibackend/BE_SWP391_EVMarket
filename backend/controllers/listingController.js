const listingService = require("../services/listingService");

exports.createListing = async (req, res) => {
  try {
    const listing = await listingService.createListing(req.body);
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await listingService.getListingById(req.params.id);
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllListings = async (req, res) => {
  try {
    const listings = await listingService.getAllListings(req.query);
    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getListingsBySeller = async (req, res) => {
  try {
    const listings = await listingService.getListingsBySeller(
      req.params.sellerId
    );
    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

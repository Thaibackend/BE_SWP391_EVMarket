const listingService = require("../services/listingService");

exports.createListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const listing = await listingService.createListing(userId, req.body);
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
exports.getAllListingsAllStatus = async (req, res) => {
  try {
    const listings = await listingService.getAllListingsAllStatus(req.query);
    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getListingApprove = async (req, res) => {
  try {
    const listings = await listingService.getListingApprove(req.query);
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

exports.updateListing = async (req, res) => {
  try {
    const listing = await listingService.updateListing(req.params.id, req.body);
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const listing = await listingService.updateStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    await listingService.deleteListing(req.params.id);
    res.json({ success: true, message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getListingsByType = async (req, res) => {
  try {
    const { type } = req.query;
    const listings = await listingService.getListingsByType(type);
    return res.json({ ok: true, data: listings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

exports.compareListings = async (req, res) => {
  try {
    const { listing1, listing2 } = req.body;
    if (!listing1 || !listing2) {
      return res
        .status(400)
        .json({ ok: false, message: "listing1 and listing2 are required" });
    }

    const result = await listingService.compareListings(listing1, listing2);
    return res.json({ ok: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: error.message });
  }
};

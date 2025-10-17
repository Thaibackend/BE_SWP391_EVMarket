const listingService = require("../services/listingService");

exports.createListing = async (req, res) => {
  try {
    const listing = await listingService.createListing(req.body);
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Listing = require("../models/Listing");
const { compareListings } = require("../services/aiService");

const compareListingsController = async (req, res) => {
  try {
    const { id1, id2 } = req.body;
    if (!id1 || !id2) {
      return res.status(400).json({ error: "Thiếu listing IDs" });
    }

    const listing1 = await Listing.findById(id1)
      .populate("brand seller")
      .lean();
    const listing2 = await Listing.findById(id2)
      .populate("brand seller")
      .lean();

    if (!listing1 || !listing2) {
      return res.status(404).json({ error: "Không tìm thấy listing" });
    }

    const aiResult = await compareListings(listing1, listing2);
    return res.json({ comparison: aiResult });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { compareListingsController };

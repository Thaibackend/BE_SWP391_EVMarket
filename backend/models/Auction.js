const mongoose = require("mongoose");
const auctionSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    startPrice: Number,
    currentPrice: Number,
    endTime: Date,
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Auction", auctionSchema);

const mongoose = require("mongoose");
const listingSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["car", "battery"] },
    title: String,
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    model: { type: mongoose.Schema.Types.ObjectId, ref: "CarModel" },
    year: Number,
    batteryCapacity: Number,
    kmDriven: Number,
    price: Number,
    aiSuggestedPrice: Number,
    images: [String],
    status: {
      type: String,
      enum: ["active", "sold", "pending"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Listing", listingSchema);

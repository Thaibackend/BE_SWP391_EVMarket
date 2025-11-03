const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "VND" },
    durationDays: { type: Number, default: 30 },
    features: [{ type: String }],
    maxListings: { type: Number, default: null },
    active: { type: Boolean, default: true },
    meta: { type: Object },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Package", packageSchema);

const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Tesla, VinFast, Hyundai
    country: String, // Quốc gia
    logo: String, // Link ảnh logo
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Brand", brandSchema);

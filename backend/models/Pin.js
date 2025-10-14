const mongoose = require("mongoose");
const pinSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    capacity: Number, // Dung lượng pin (kWh)
    brand: String, // Hãng pin (LG, CATL, VinFast...)
    health: Number, // % tình trạng còn lại
    year: Number, // Năm sản xuất
    cycles: Number, // Số lần sạc
    status: {
      type: String,
      enum: ["available", "sold", "pending"],
      default: "available",
    },
    price: Number,
    aiSuggestedPrice: Number,
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pin", pinSchema);

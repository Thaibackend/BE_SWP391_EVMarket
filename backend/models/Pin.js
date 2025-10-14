const mongoose = require("mongoose");
const pinSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    capacity: Number, // Dung lượng pin (kWh)
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
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
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Pin", pinSchema);

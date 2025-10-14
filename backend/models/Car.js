const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    model: { type: String, required: true }, // Ví dụ: Model 3, VF8
    year: Number, // Năm sản xuất
    batteryCapacity: Number, // Dung lượng pin (kWh)
    range: Number, // Quãng đường đi được (km)
    kmDriven: Number, // Số km đã đi
    price: Number, // Giá bán
    images: [String], // Hình ảnh
    status: {
      type: String,
      enum: ["available", "sold", "pending"],
      default: "available",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Car", carSchema);

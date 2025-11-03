const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["car", "battery"],
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    model: { type: String },
    year: { type: Number },
    price: { type: Number, required: true },
    aiSuggestedPrice: { type: Number },
    images: [{ type: String }],
    contract: { type: String, require: true },
    status: {
      type: String,
      enum: [
        "pending", // chờ duyệt
        "approved", // được duyệt
        "active", // đang hiển thị
        "processing", // đang giao dịch
        "sold", // đã bán
        "rejected", // bị từ chối
      ],
      default: "pending",
    },

    carDetails: {
      registrationNumber: { type: String },
      registrationCertificate: { type: String },
      ownerNumber: { type: Number, default: 1 },
      fuelType: {
        type: String,
        enum: ["petrol", "diesel", "electric", "hybrid"],
      },
      transmission: { type: String, enum: ["manual", "automatic"] },
      seats: { type: Number },
      color: { type: String },
      kmDriven: { type: Number },
      batteryCapacity: { type: Number },
      insuranceExpiry: { type: Date },
      inspectionExpiry: { type: Date },
      accidentHistory: { type: String },
      location: { type: String },
    },

    batteryDetails: {
      brand: { type: String },
      capacity: { type: Number }, // kWh
      voltage: { type: Number },
      cyclesUsed: { type: Number }, // số lần sạc/xả
      healthPercentage: { type: Number }, // % tình trạng pin
      warranty: { type: String }, // ví dụ: "12 tháng" hoặc "6 tháng còn lại"
      compatibleModels: [{ type: String }], // danh sách xe tương thích
      serialNumber: { type: String },
      manufactureDate: { type: Date },
      location: { type: String },
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Listing", listingSchema);

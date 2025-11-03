const mongoose = require("mongoose");

const userPackageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
      index: true,
    },

    transactionId: { type: String, default: null },
    contract: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },

    paidPrice: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "vnpay", "other"],
      default: "other",
    },

    notes: { type: String },
    meta: { type: Object },
  },
  { timestamps: true, versionKey: false }
);

userPackageSchema.virtual("isActive").get(function () {
  if (this.status !== "active") return false;
  if (!this.startDate) return true;
  if (this.endDate && new Date() > this.endDate) return false;
  return true;
});

module.exports = mongoose.model("UserPackage", userPackageSchema);

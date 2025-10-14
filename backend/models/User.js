const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["member", "admin"], default: "member" },
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    avatar: String,
    vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
    transactionHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    ],
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("User", userSchema);

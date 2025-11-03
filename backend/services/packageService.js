const Package = require("../models/Package");
const UserPackage = require("../models/UserPackage");
const User = require("../models/User");

async function createPackage(data) {
  const pkg = new Package(data);
  return await pkg.save();
}

async function listPackages(filter = {}) {
  return await Package.find(filter).lean();
}

async function assignPackageToUser({
  userId,
  packageId,
  paidPrice = 0,
  paymentMethod = "other",
  transactionId = null,
  contract = null,
}) {
  const pkg = await Package.findById(packageId);
  if (!pkg) throw new Error("Package not found");

  const start = new Date();
  const end =
    pkg.durationDays && pkg.durationDays > 0
      ? new Date(start.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000)
      : null;

  const up = new UserPackage({
    user: userId,
    package: packageId,
    transactionId,
    contract,
    status: pkg.durationDays ? "active" : "active",
    startDate: start,
    endDate: end,
    paidPrice,
    paymentMethod,
  });

  const saved = await up.save();

  await User.findByIdAndUpdate(userId, {
    $push: { packages: saved._id },
  }).catch(() => {});

  return saved;
}

async function getUserPackages(userId) {
  return await UserPackage.find({ user: userId })
    .populate("package")
    .sort({ createdAt: -1 })
    .lean();
}

async function countUsersByPackage(packageId) {
  const count = await UserPackage.countDocuments({ package: packageId });
  return count;
}

async function getUsersByPackage(packageId) {
  const users = await UserPackage.find({ package: packageId })
    .populate("user", "name email")
    .lean();
  return users;
}

module.exports = {
  createPackage,
  listPackages,
  assignPackageToUser,
  getUserPackages,
  countUsersByPackage,
  getUsersByPackage,
};

const UserPackage = require("../models/UserPackage");

async function getCancelledPackages(userId) {
  if (!userId) throw new Error("userId là bắt buộc");

  const cancelledPackages = await UserPackage.find({
    user: userId,
    status: "cancelled",
  })
    .populate("package")
    .sort({ startDate: -1 });

  return cancelledPackages;
}

module.exports = {
  getCancelledPackages,
};

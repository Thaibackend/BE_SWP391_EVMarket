const packageService = require("../services/packageService");

exports.createPackage = async (req, res) => {
  try {
    const data = req.body;
    const pkg = await packageService.createPackage(data);
    return res.status(201).json({
      success: true,
      message: "Tạo gói thành công",
      data: pkg,
    });
  } catch (err) {
    console.error("Error createPackage:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi tạo gói",
    });
  }
};

exports.listPackages = async (req, res) => {
  try {
    const filter = req.query || {};
    const list = await packageService.listPackages(filter);
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    console.error("Error listPackages:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách gói",
    });
  }
};

exports.assignPackageToUser = async (req, res) => {
  try {
    const {
      userId,
      packageId,
      paidPrice,
      paymentMethod,
      transactionId,
      contract,
    } = req.body;

    const result = await packageService.assignPackageToUser({
      userId,
      packageId,
      paidPrice,
      paymentMethod,
      transactionId,
      contract,
    });

    return res.status(201).json({
      success: true,
      message: "Gán gói cho user thành công",
      data: result,
    });
  } catch (err) {
    console.error("Error assignPackageToUser:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi gán gói cho user",
    });
  }
};

exports.getUserPackages = async (req, res) => {
  try {
    const { userId } = req.params;
    const packages = await packageService.getUserPackages(userId);

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (err) {
    console.error("Error getUserPackages:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách gói của user",
    });
  }
};

exports.getUserCountByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const count = await packageService.countUsersByPackage(packageId);

    return res.status(200).json({
      success: true,
      message: "Số người đã mua gói",
      packageId,
      totalUsers: count,
    });
  } catch (err) {
    console.error("Error getUserCountByPackage:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy số người mua gói",
    });
  }
};

exports.getUsersByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const users = await packageService.getUsersByPackage(packageId);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.error("Error getUsersByPackage:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách user của gói",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await packageService.updatePackage(id, req.body);
    res.json({ ok: true, data: updated });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
};

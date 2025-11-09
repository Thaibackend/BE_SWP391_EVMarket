const userPackageService = require("../services/userPackageService");

exports.getCancelledPackages = async (req, res) => {
  try {
    const { userId } = req.params;
    const cancelledPackages = await userPackageService.getCancelledPackages(
      userId
    );

    return res.status(200).json({
      success: true,
      data: cancelledPackages,
    });
  } catch (err) {
    console.error("Error getCancelledPackages:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy gói cancelled",
    });
  }
};

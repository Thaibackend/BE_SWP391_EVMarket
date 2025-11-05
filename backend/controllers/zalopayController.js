const zalopayService = require("../services/zalopayService");

// Tạo order
async function createPayment(req, res) {
  try {
    const { amount, description } = req.body;
    const data = await zalopayService.createOrder({ amount, description });
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Tạo đơn ZaloPay thất bại", error: err.message });
  }
}

// Callback ZaloPay (nhận trạng thái thanh toán)
function callback(req, res) {
  const { returncode, transid } = req.body;
  // TODO: verify MAC nếu muốn xác thực
  if (returncode == 1) {
    // thanh toán thành công
    res.json({ status: "success", transid });
  } else {
    res.json({ status: "failed", transid });
  }
}

module.exports = { createPayment, callback };

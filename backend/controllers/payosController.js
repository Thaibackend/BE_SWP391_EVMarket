const payosService = require("../services/payosService");

// Tạo payment
async function createPayment(req, res) {
  try {
    const { amount, orderId } = req.body;
    if (!amount || !orderId) {
      return res.status(400).json({ error: "amount và orderId là bắt buộc" });
    }

    const result = await payosService.createPayment(amount, orderId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Payment creation failed", message: err.message });
  }
}

// Kiểm tra trạng thái payment
async function paymentStatus(req, res) {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ error: "orderId là bắt buộc" });
    }

    const result = await payosService.getPaymentStatus(orderId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Check payment status failed", message: err.message });
  }
}

module.exports = { createPayment, paymentStatus };

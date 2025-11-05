const vnpayService = require("../services/vnpayService");

/**
 * POST /create_payment
 * body: { amount, orderId, orderInfo }
 */
async function createPayment(req, res) {
  try {
    const { amount, orderId, orderInfo } = req.body;
    if (!amount || !orderId)
      return res.status(400).json({ message: "amount và orderId bắt buộc" });

    const ipAddr = req.ip || req.connection?.remoteAddress || "127.0.0.1";
    const { paymentUrl, vnp_Params } = vnpayService.createPaymentUrl({
      amount,
      orderId,
      orderInfo,
      ipAddr,
    });

    return res.json({ success: true, paymentUrl, vnp_Params });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Tạo payment lỗi", error: err.message });
  }
}

/**
 * GET /vnpay_return
 */
function vnpayReturn(req, res) {
  try {
    const vnpData = req.query;
    const ok = vnpayService.verifyReturn(vnpData);

    if (!ok) return res.status(400).send("INVALID SIGNATURE");

    const rspCode = vnpData.vnp_ResponseCode;
    const txnRef = vnpData.vnp_TxnRef;

    if (rspCode === "00") {
      return res.send(`Thanh toán thành công cho order ${txnRef}`);
    } else {
      return res.send(`Thanh toán không thành công, mã: ${rspCode}`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Lỗi server");
  }
}

module.exports = { createPayment, vnpayReturn };

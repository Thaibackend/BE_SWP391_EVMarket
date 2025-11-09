// controllers/payosController.js
require("dotenv").config();
const { PayOS } = require("@payos/node");

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

exports.createPayment = async (req, res) => {
  try {
    const { amount, description, userId, packageId } = req.body;

    const orderCode = Date.now();

    // Thêm userId và packageId vào returnUrl
    const returnUrl = `${process.env.PAYOS_RETURN_URL}?status=PAID&userId=${userId}&packageId=${packageId}`;
    const cancelUrl = `${process.env.PAYOS_CANCEL_URL}?status=CANCEL&userId=${userId}&packageId=${packageId}`;

    const body = {
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
    };

    const paymentLink = await payos.paymentRequests.create(body);

    res.json({ checkoutUrl: paymentLink.checkoutUrl });
  } catch (error) {
    console.error("❌ Error creating payment:", error);
    res.status(500).json({
      message: "Error creating payment",
      error: error.message || error,
    });
  }
};

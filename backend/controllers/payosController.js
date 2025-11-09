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
    const { amount, description } = req.body;

    const body = {
      orderCode: Date.now(),
      amount,
      description,
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
    };

    const paymentLink = await payos.paymentRequests.create(body);
    res.json({ checkoutUrl: paymentLink.checkoutUrl });
  } catch (error) {
    console.error("❌ Error creating payment:", error);
    res
      .status(500)
      .json({
        message: "Error creating payment",
        error: error.message || error,
      });
  }
};

require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const QRCode = require("qrcode");

const CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
const RETURN_URL = process.env.PAYOS_RETURN_URL;
const CANCEL_URL = process.env.PAYOS_CANCEL_URL;
const BASE_URL = process.env.PAYOS_BASE_URL;

// Tạo checksum PayOS
function createChecksum(data) {
  const sortedKeys = Object.keys(data).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${data[k]}`).join("&");
  return crypto
    .createHmac("sha256", CHECKSUM_KEY)
    .update(stringToSign)
    .digest("hex");
}

// Tạo payment thực
async function createPayment(amount, orderId) {
  const payload = {
    client_id: CLIENT_ID,
    order_id: orderId,
    amount,
    description: `Thanh toán #${orderId}`,
    return_url: RETURN_URL,
    cancel_url: CANCEL_URL,
    timestamp: Date.now(),
  };
  payload.checksum = createChecksum(payload);

  try {
    const response = await axios.post(`${BASE_URL}/payments`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // sandbox đôi khi chậm
    });

    const paymentLink = response.data.payment_url; // giả sử PayOS trả về field này
    const qrCodeDataUrl = await QRCode.toDataURL(paymentLink);

    return {
      orderId,
      amount,
      paymentLink,
      qrCodeDataUrl,
      status: "PENDING",
    };
  } catch (err) {
    console.error("createPayment error:", err.response?.data || err.message);
    throw err;
  }
}

// Lấy trạng thái thanh toán
async function getPaymentStatus(orderId) {
  try {
    const payload = {
      client_id: CLIENT_ID,
      order_id: orderId,
      timestamp: Date.now(),
    };
    payload.checksum = createChecksum(payload);

    const response = await axios.get(`${BASE_URL}/payments/${orderId}`, {
      params: payload,
      timeout: 10000,
    });

    return response.data;
  } catch (err) {
    console.error("getPaymentStatus error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { createPayment, getPaymentStatus };

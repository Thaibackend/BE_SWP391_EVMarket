require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

const APP_ID = process.env.ZALOPAY_APP_ID;
const KEY1 = process.env.ZALOPAY_KEY1;
const KEY2 = process.env.ZALOPAY_KEY2;
const ENDPOINT = process.env.ZALOPAY_ENDPOINT;
const CALLBACK_URL = process.env.ZALOPAY_CALLBACK_URL;

// tạo HMAC SHA256
function createMac(data) {
  const jsonData = JSON.stringify(data);
  return crypto.createHmac("sha256", KEY1).update(jsonData).digest("hex");
}

// tạo order thanh toán
async function createOrder({ amount, orderId, description }) {
  const appTransId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const embedData = JSON.stringify({});
  const items = JSON.stringify([]);

  const data = {
    app_id: parseInt(APP_ID),
    app_trans_id: appTransId,
    app_user: "user123",
    amount: amount,
    app_time: Date.now(),
    item: items,
    description: description || `Thanh toán #${orderId}`,
    embed_data: embedData,
    callback_url: CALLBACK_URL,
  };

  const mac = createMac(data);
  const payload = { ...data, mac };

  try {
    const res = await axios.post(ENDPOINT, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    return res.data; // có zptr, qr code url
  } catch (err) {
    console.error(
      "ZaloPay createOrder error:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { createOrder };

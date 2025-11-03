require("dotenv").config();
const crypto = require("crypto");
const QRCode = require("qrcode");

const CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
const RETURN_URL = process.env.PAYOS_RETURN_URL;
const CANCEL_URL = process.env.PAYOS_CANCEL_URL;

// Tạo checksum cho PayOS
function createChecksum(data) {
  const sortedKeys = Object.keys(data).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${data[k]}`).join("&");
  return crypto
    .createHmac("sha256", CHECKSUM_KEY)
    .update(stringToSign)
    .digest("hex");
}

// Tạo payment link + QR code
async function createPaymentLink(amount, orderId) {
  const timestamp = Date.now();
  const params = {
    client_id: CLIENT_ID,
    order_id: orderId,
    amount,
    description: `Thanh toán #${orderId}`,
    return_url: RETURN_URL,
    cancel_url: CANCEL_URL,
    timestamp,
  };

  const checksum = createChecksum(params);
  const urlParams = new URLSearchParams({ ...params, checksum }).toString();
  const paymentLink = `https://sandbox.payos.vn/pay?${urlParams}`;

  // Sinh QR code từ link thanh toán (dạng Data URL)
  const qrCodeDataUrl = await QRCode.toDataURL(paymentLink);

  return {
    orderId,
    amount,
    paymentLink,
    qrCodeDataUrl,
    status: "PENDING",
  };
}

module.exports = { createPaymentLink };

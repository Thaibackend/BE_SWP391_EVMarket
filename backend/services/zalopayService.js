require("dotenv").config();
const axios = require("axios");
const CryptoJS = require("crypto-js");
const { v1: uuidv1 } = require("uuid");
const moment = require("moment");
const qs = require("qs");

const APP_ID = process.env.ZALOPAY_APP_ID;
const KEY1 = process.env.ZALOPAY_KEY1;
const ENDPOINT = process.env.ZALOPAY_ENDPOINT;
const CALLBACK_URL = process.env.ZALOPAY_CALLBACK_URL;

function generateAppTransId() {
  return `${moment().format("YYMMDD")}_${uuidv1()}`;
}

function generateMac(order) {
  // Tạo chuỗi dữ liệu chuẩn theo ZaloPay
  const data = `${order.appid}|${order.apptransid}|${order.appuser}|${order.amount}|${order.apptime}|${order.embeddata}|${order.item}`;
  return CryptoJS.HmacSHA256(data, KEY1).toString();
}

async function createOrder({ amount, description }) {
  const apptransid = generateAppTransId();
  const apptime = Date.now();

  // embeddata và items phải stringify đúng chuẩn
  const embeddata = JSON.stringify({ merchantinfo: "Demo embed data" });
  const items = JSON.stringify([
    {
      itemid: "item1",
      itemname: "Demo Item",
      itemprice: amount,
      itemquantity: 1,
    },
  ]);

  const order = {
    appid: APP_ID,
    apptransid,
    appuser: "demo",
    apptime,
    amount,
    description,
    bankcode: "zalopayapp",
    item: items,
    embeddata,
    callbackurl: CALLBACK_URL,
  };

  order.mac = generateMac(order);

  try {
    const response = await axios.post(ENDPOINT, qs.stringify(order), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data; // Trả về qrCode hoặc token
  } catch (err) {
    console.error(
      "ZaloPay createOrder error:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { createOrder };

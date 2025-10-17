const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {
  try {
    const { buyer, seller, listing, price } = req.body;
    const order = await orderService.createOrder(buyer, seller, listing, price);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

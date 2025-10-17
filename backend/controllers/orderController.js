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
exports.getOrdersByBuyer = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await orderService.getOrdersByBuyer(userId);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrdersBySeller = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await orderService.getOrdersBySeller(userId);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

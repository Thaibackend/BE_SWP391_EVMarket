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

exports.updateStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await orderService.updateStatus(orderId, status);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { contractUrl } = req.body;
    const order = await orderService.updateContract(orderId, contractUrl);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    await orderService.deleteOrder(orderId);
    res.json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

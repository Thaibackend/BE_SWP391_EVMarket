const Order = require("../models/Order");

class OrderService {
  async createOrder(buyer, seller, listing, price) {
    return await Order.create({ buyer, seller, listing, price });
  }

  async getOrdersByBuyer(buyerId) {
    return await Order.find({ buyer: buyerId }).populate("seller listing");
  }

  async getOrdersBySeller(sellerId) {
    return await Order.find({ seller: sellerId }).populate("buyer listing");
  }

  async updateStatus(orderId, status) {
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  }

  async updateContract(orderId, contractUrl) {
    return await Order.findByIdAndUpdate(
      orderId,
      { contractUrl },
      { new: true }
    );
  }
  async deleteOrder(orderId) {
    return await Order.findByIdAndDelete(orderId);
  }
}

module.exports = new OrderService();

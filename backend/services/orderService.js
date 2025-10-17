const Order = require("../models/Order");

class OrderService {
  async createOrder(buyer, seller, listing, price) {
    return await Order.create({ buyer, seller, listing, price });
  }
}

module.exports = new OrderService();

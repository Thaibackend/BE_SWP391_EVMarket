const Order = require("../models/Order");
const Listing = require("../models/Listing");
class OrderService {
  async createOrder(buyer, seller, listingId, price) {
    const listing = await Listing.findById(listingId);
    if (!listing) throw new Error("Listing không tồn tại");

    if (listing.status === "sold") {
      throw new Error("Xe này đã được bán rồi");
    }

    const order = await Order.create({
      buyer,
      seller,
      listing: listingId,
      price,
      status: "pending",
    });

    listing.status = "processing";
    await listing.save();

    return order;
  }

  async getOrdersByBuyer(buyerId) {
    return await Order.find({ buyer: buyerId }).populate("seller listing");
  }

  async getOrdersBySeller(sellerId) {
    return await Order.find({ seller: sellerId }).populate("buyer listing");
  }

  async updateStatus(orderId, status) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    if (status === "completed") {
      await Listing.findByIdAndUpdate(order.listing, { status: "sold" });
    }

    if (status === "cancelled") {
      await Listing.findByIdAndUpdate(order.listing, { status: "approved" });
    }

    return order;
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

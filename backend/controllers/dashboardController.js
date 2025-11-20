const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const Order = require("../models/Order");
const User = require("../models/User");
const Review = require("../models/Review");
const UserPackage = require("../models/UserPackage");
const Package = require("../models/Package");
const getLastNDays = (n) => {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    arr.push(d);
  }
  return arr;
};
exports.getSummary = async (req, res) => {
  try {
    const [totalUsers, totalListings, totalOrders, totalReviews] =
      await Promise.all([
        User.countDocuments(),
        Listing.countDocuments(),
        Order.countDocuments(),
        Review.countDocuments(),
      ]);

    const listingStatusAgg = await Listing.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const listingStatus = listingStatusAgg.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    const days = getLastNDays(7);
    const startDate = days[0];

    const userPackages = await UserPackage.find({
      status: "active",
      updatedAt: { $gte: startDate },
    })
      .populate("package", "price")
      .lean();

    const revenueMap = {};
    days.forEach((d) => {
      const key = d.toISOString().slice(0, 10);
      revenueMap[key] = { date: key, revenue: 0, orders: 0 };
    });

    userPackages.forEach((up) => {
      const key = up.updatedAt.toISOString().slice(0, 10);
      if (revenueMap[key]) {
        revenueMap[key].revenue += up.package?.price ?? 0;
        revenueMap[key].orders += 1;
      }
    });

    const revenueByDay = days.map((d) => {
      const key = d.toISOString().slice(0, 10);
      return revenueMap[key];
    });

    // Top sellers
    const topSellers = await Listing.aggregate([
      { $group: { _id: "$seller", listings: { $sum: 1 } } },
      { $sort: { listings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $project: {
          _id: 0,
          sellerId: "$seller._id",
          name: "$seller.name",
          listings: 1,
          email: "$seller.email",
        },
      },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("listing", "title images")
      .lean();

    return res.json({
      totals: {
        users: totalUsers,
        listings: totalListings,
        orders: totalOrders,
        reviews: totalReviews,
      },
      listingStatus,
      revenueByDay,
      topSellers,
      recentOrders,
    });
  } catch (err) {
    console.error("dashboard getSummary err:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSellerDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // Tổng số listing của seller
    const totalListings = await Listing.countDocuments({ seller: userId });

    // Tổng đơn hàng có liên quan tới seller
    const totalOrders = await Order.countDocuments({ seller: userId });

    // Tổng số review người khác viết về seller
    const totalReviews = await Review.countDocuments({ target: userId });

    // Tính tổng doanh thu đã thanh toán
    const totalRevenueAgg = await Order.aggregate([
      {
        $match: {
          seller:
            require("mongoose").Types.ObjectId.createFromHexString(userId),
          isPaid: true,
          status: { $in: ["completed", "approved"] },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$price" } },
      },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Doanh thu 7 ngày gần nhất
    const days = getLastNDays(7);
    const startDate = days[0];

    const revenueAgg = await Order.aggregate([
      {
        $match: {
          seller:
            require("mongoose").Types.ObjectId.createFromHexString(userId),
          isPaid: true,
          status: { $in: ["completed", "approved"] },
          updatedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          revenue: { $sum: "$price" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueMap = revenueAgg.reduce((acc, cur) => {
      acc[cur._id] = { revenue: cur.revenue, orders: cur.orders };
      return acc;
    }, {});

    const revenueByDay = days.map((d) => {
      const key = d.toISOString().slice(0, 10);
      return {
        date: key,
        revenue: revenueMap[key]?.revenue || 0,
        orders: revenueMap[key]?.orders || 0,
      };
    });

    // Top sản phẩm (Listing) theo doanh thu
    const topListings = await Order.aggregate([
      {
        $match: {
          seller:
            require("mongoose").Types.ObjectId.createFromHexString(userId),
          isPaid: true,
        },
      },
      {
        $group: {
          _id: "$listing",
          revenue: { $sum: "$price" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "listings",
          localField: "_id",
          foreignField: "_id",
          as: "listing",
        },
      },
      { $unwind: "$listing" },
      {
        $project: {
          _id: 0,
          listingId: "$listing._id",
          title: "$listing.title",
          revenue: 1,
          orders: 1,
          image: { $arrayElemAt: ["$listing.images", 0] },
        },
      },
    ]);

    // Đơn hàng gần đây
    const recentOrders = await Order.find({ seller: userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("buyer", "name email")
      .populate("listing", "title images price")
      .lean();

    res.json({
      totals: {
        listings: totalListings,
        orders: totalOrders,
        reviews: totalReviews,
        revenue: totalRevenue,
      },
      revenueByDay,
      topListings,
      recentOrders,
    });
  } catch (err) {
    console.error("getSellerDashboard error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

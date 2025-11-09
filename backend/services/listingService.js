const Listing = require("../models/Listing");
const UserPackage = require("../models/UserPackage");
const User = require("../models/User");
const Package = require("../models/Package");
class ListingService {
  async createListing(userId, listingData) {
    // 1. Lấy gói đang dùng
    const userPackage = await UserPackage.findOne({
      user: userId,
      status: "active",
    }).populate("package");

    if (!userPackage) {
      throw new Error("Bạn chưa mua gói dịch vụ, không thể đăng bài.");
    }

    const pkg = userPackage.package;

    // 2. Kiểm tra maxListings
    if (pkg.maxListings !== null) {
      const currentCount = await Listing.countDocuments({ owner: userId });
      if (currentCount >= pkg.maxListings) {
        throw new Error(
          `Bạn đã đạt số lượng bài đăng tối đa (${pkg.maxListings}) của gói ${pkg.name}.`
        );
      }
    }

    // 3. Tạo bài đăng
    const listing = await Listing.create({
      ...listingData,
      owner: userId,
      package: pkg._id,
    });

    // 4. Cập nhật số lượng bài đăng user
    await User.findByIdAndUpdate(userId, { $inc: { postCount: 1 } });

    return listing;
  }

  async getListingById(id) {
    return await Listing.findById(id).populate("seller brand");
  }

  async getAllListings(filters) {
    const query = {
      status: { $in: ["active", "approved", "sold"] },
    };

    if (filters.type) query.type = filters.type;
    if (filters.brand) query.brand = filters.brand;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    return await Listing.find(query).populate("seller brand");
  }

  async getListingApprove(filters) {
    const query = {
      status: { $in: ["approved"] },
    };

    if (filters.type) query.type = filters.type;
    if (filters.brand) query.brand = filters.brand;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    return await Listing.find(query).populate("seller brand");
  }

  async getListingsBySeller(sellerId) {
    return await Listing.find({ seller: sellerId }).populate("brand");
  }

  async updateListing(id, data) {
    return await Listing.findByIdAndUpdate(id, data, { new: true });
  }

  async updateStatus(id, status) {
    return await Listing.findByIdAndUpdate(id, { status }, { new: true });
  }

  async deleteListing(id) {
    return await Listing.findByIdAndDelete(id);
  }

  async getListingsByType(type) {
    const query = { status: "approved" };

    if (type) query.type = type;

    return await Listing.find(query)
      .populate("seller", "name email")
      .populate("brand", "name");
  }

  async compareListings(id1, id2) {
    const listing1 = await Listing.findById(id1);
    const listing2 = await Listing.findById(id2);

    if (!listing1 || !listing2) {
      throw new Error("One or both listings not found");
    }

    return {
      listing1,
      listing2,
      comparison: {
        priceDifference: (listing1.price ?? 0) - (listing2.price ?? 0),
        yearDifference: (listing1.year ?? 0) - (listing2.year ?? 0),
        kmDifference: (listing1.kmDriven ?? 0) - (listing2.kmDriven ?? 0),
        batteryDifference:
          (listing1.batteryCapacity ?? 0) - (listing2.batteryCapacity ?? 0),
      },
    };
  }
}

module.exports = new ListingService();

const Brand = require("../models/Brand");

class BrandService {
  async createBrand(data) {
    const brand = new Brand(data);
    return await brand.save();
  }

  async getAllBrands() {
    return await Brand.find().sort({ name: 1 });
  }

  async getBrandById(id) {
    return await Brand.findById(id);
  }

  async updateBrand(id, data) {
    return await Brand.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteBrand(id) {
    return await Brand.findByIdAndDelete(id);
  }
}

module.exports = new BrandService();

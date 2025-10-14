const brandService = require("../services/brandService");

class BrandController {
  async create(req, res) {
    try {
      const brand = await brandService.createBrand(req.body);
      res.status(201).json({ success: true, data: brand });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const brands = await brandService.getAllBrands();
      res.json({ success: true, data: brands });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const brand = await brandService.getBrandById(req.params.id);
      if (!brand)
        return res
          .status(404)
          .json({ success: false, message: "Brand not found" });
      res.json({ success: true, data: brand });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await brandService.updateBrand(req.params.id, req.body);
      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Brand not found" });
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await brandService.deleteBrand(req.params.id);
      if (!deleted)
        return res
          .status(404)
          .json({ success: false, message: "Brand not found" });
      res.json({ success: true, message: "Brand deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BrandController();

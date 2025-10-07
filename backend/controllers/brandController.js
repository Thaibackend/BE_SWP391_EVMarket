const Brand = require('../models/Brand');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

class BrandController {
    // Get all brands (Public)
    static async getAllBrands(req, res) {
        try {
            const brands = await Brand.getAll();

            res.json({
                success: true,
                data: brands
            });
        } catch (error) {
            console.error('Get all brands error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get brands',
                error: error.message
            });
        }
    }

    // Get brand by ID (Public)
    static async getBrandById(req, res) {
        try {
            const { brandId } = req.params;
            const brand = await Brand.findById(parseInt(brandId));

            if (!brand) {
                return res.status(404).json({
                    success: false,
                    message: 'Brand not found'
                });
            }

            res.json({
                success: true,
                data: brand
            });
        } catch (error) {
            console.error('Get brand by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get brand',
                error: error.message
            });
        }
    }

    // Create brand (Admin only)
    static async createBrand(req, res) {
        try {
            const { brandName } = req.body;

            // Check if brand already exists
            const existingBrands = await Brand.getAll();
            const existingBrand = existingBrands.find(brand => 
                brand.brandName.toLowerCase() === brandName.toLowerCase()
            );

            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: 'Brand with this name already exists'
                });
            }

            const brand = await Brand.create(brandName);

            res.status(201).json({
                success: true,
                message: 'Brand created successfully',
                data: brand
            });
        } catch (error) {
            console.error('Create brand error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create brand',
                error: error.message
            });
        }
    }

    // Update brand (Admin only)
    static async updateBrand(req, res) {
        try {
            const { brandId } = req.params;
            const { brandName } = req.body;

            // Check if brand exists
            const existingBrand = await Brand.findById(parseInt(brandId));
            if (!existingBrand) {
                return res.status(404).json({
                    success: false,
                    message: 'Brand not found'
                });
            }

            // Check if new name already exists
            const allBrands = await Brand.getAll();
            const duplicateBrand = allBrands.find(brand => 
                brand.brandId !== parseInt(brandId) && 
                brand.brandName.toLowerCase() === brandName.toLowerCase()
            );

            if (duplicateBrand) {
                return res.status(400).json({
                    success: false,
                    message: 'Brand with this name already exists'
                });
            }

            const updatedBrand = await Brand.update(parseInt(brandId), brandName);

            res.json({
                success: true,
                message: 'Brand updated successfully',
                data: updatedBrand
            });
        } catch (error) {
            console.error('Update brand error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update brand',
                error: error.message
            });
        }
    }

    // Delete brand (Admin only)
    static async deleteBrand(req, res) {
        try {
            const { brandId } = req.params;

            // Check if brand exists
            const existingBrand = await Brand.findById(parseInt(brandId));
            if (!existingBrand) {
                return res.status(404).json({
                    success: false,
                    message: 'Brand not found'
                });
            }

            const deleted = await Brand.delete(parseInt(brandId));

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Brand deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete brand'
                });
            }
        } catch (error) {
            console.error('Delete brand error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete brand',
                error: error.message
            });
        }
    }
}

module.exports = BrandController;

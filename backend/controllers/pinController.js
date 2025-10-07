const Pin = require('../models/Pin');
const Brand = require('../models/Brand');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

class PinController {
    // Get all pins (Public)
    static async getAllPins(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            // For now, we'll use search with no filters to get all pins
            const pins = await Pin.search({});
            const totalCount = pins.length;

            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedPins = pins.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: {
                    pins: paginatedPins,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalCount / limitNum),
                        totalItems: totalCount,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get all pins error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get pins',
                error: error.message
            });
        }
    }

    // Get pin by ID (Public)
    static async getPinById(req, res) {
        try {
            const { pinId } = req.params;
            const pin = await Pin.findById(parseInt(pinId));

            if (!pin) {
                return res.status(404).json({
                    success: false,
                    message: 'Pin not found'
                });
            }

            res.json({
                success: true,
                data: pin
            });
        } catch (error) {
            console.error('Get pin by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get pin',
                error: error.message
            });
        }
    }

    // Search pins (Public)
    static async searchPins(req, res) {
        try {
            const filters = req.query;
            const pins = await Pin.search(filters);

            res.json({
                success: true,
                data: pins
            });
        } catch (error) {
            console.error('Search pins error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search pins',
                error: error.message
            });
        }
    }

    // Create pin (Admin only)
    static async createPin(req, res) {
        try {
            const { brandId, capacity, model, status, manufactureYear, description } = req.body;

            // Verify brand exists
            const brand = await Brand.findById(brandId);
            if (!brand) {
                return res.status(400).json({
                    success: false,
                    message: 'Brand not found'
                });
            }

            const pinData = {
                brandId,
                capacity,
                model,
                status,
                manufactureYear,
                description
            };

            const pin = await Pin.create(pinData);

            res.status(201).json({
                success: true,
                message: 'Pin created successfully',
                data: pin
            });
        } catch (error) {
            console.error('Create pin error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create pin',
                error: error.message
            });
        }
    }

    // Update pin (Admin only)
    static async updatePin(req, res) {
        try {
            const { pinId } = req.params;
            const updateData = req.body;

            // Check if pin exists
            const existingPin = await Pin.findById(parseInt(pinId));
            if (!existingPin) {
                return res.status(404).json({
                    success: false,
                    message: 'Pin not found'
                });
            }

            // If brandId is being updated, verify brand exists
            if (updateData.brandId) {
                const brand = await Brand.findById(updateData.brandId);
                if (!brand) {
                    return res.status(400).json({
                        success: false,
                        message: 'Brand not found'
                    });
                }
            }

            const updatedPin = await Pin.update(parseInt(pinId), updateData);

            res.json({
                success: true,
                message: 'Pin updated successfully',
                data: updatedPin
            });
        } catch (error) {
            console.error('Update pin error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update pin',
                error: error.message
            });
        }
    }

    // Delete pin (Admin only)
    static async deletePin(req, res) {
        try {
            const { pinId } = req.params;

            // Check if pin exists
            const existingPin = await Pin.findById(parseInt(pinId));
            if (!existingPin) {
                return res.status(404).json({
                    success: false,
                    message: 'Pin not found'
                });
            }

            const deleted = await Pin.delete(parseInt(pinId));

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Pin deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete pin'
                });
            }
        } catch (error) {
            console.error('Delete pin error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete pin',
                error: error.message
            });
        }
    }
}

module.exports = PinController;

const Car = require('../models/Car');
const Brand = require('../models/Brand');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

class CarController {
    // Get all cars (Public)
    static async getAllCars(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            // For now, we'll use search with no filters to get all cars
            const cars = await Car.search({});
            const totalCount = cars.length;

            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedCars = cars.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: {
                    cars: paginatedCars,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalCount / limitNum),
                        totalItems: totalCount,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get all cars error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get cars',
                error: error.message
            });
        }
    }

    // Get car by ID (Public)
    static async getCarById(req, res) {
        try {
            const { carId } = req.params;
            const car = await Car.findById(parseInt(carId));

            if (!car) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
                });
            }

            res.json({
                success: true,
                data: car
            });
        } catch (error) {
            console.error('Get car by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get car',
                error: error.message
            });
        }
    }

    // Search cars (Public)
    static async searchCars(req, res) {
        try {
            const filters = req.query;
            const cars = await Car.search(filters);

            res.json({
                success: true,
                data: cars
            });
        } catch (error) {
            console.error('Search cars error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search cars',
                error: error.message
            });
        }
    }

    // Create car (Admin only)
    static async createCar(req, res) {
        try {
            const { brandId, model, year, batteryCapacity, kilometers, description, status } = req.body;

            // Verify brand exists
            const brand = await Brand.findById(brandId);
            if (!brand) {
                return res.status(400).json({
                    success: false,
                    message: 'Brand not found'
                });
            }

            const carData = {
                brandId,
                model,
                year,
                batteryCapacity,
                kilometers,
                description,
                status
            };

            const car = await Car.create(carData);

            res.status(201).json({
                success: true,
                message: 'Car created successfully',
                data: car
            });
        } catch (error) {
            console.error('Create car error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create car',
                error: error.message
            });
        }
    }

    // Update car (Admin only)
    static async updateCar(req, res) {
        try {
            const { carId } = req.params;
            const updateData = req.body;

            // Check if car exists
            const existingCar = await Car.findById(parseInt(carId));
            if (!existingCar) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
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

            const updatedCar = await Car.update(parseInt(carId), updateData);

            res.json({
                success: true,
                message: 'Car updated successfully',
                data: updatedCar
            });
        } catch (error) {
            console.error('Update car error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update car',
                error: error.message
            });
        }
    }

    // Delete car (Admin only)
    static async deleteCar(req, res) {
        try {
            const { carId } = req.params;

            // Check if car exists
            const existingCar = await Car.findById(parseInt(carId));
            if (!existingCar) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
                });
            }

            const deleted = await Car.delete(parseInt(carId));

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Car deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete car'
                });
            }
        } catch (error) {
            console.error('Delete car error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete car',
                error: error.message
            });
        }
    }
}

module.exports = CarController;

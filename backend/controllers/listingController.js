const Listing = require('../models/Listing');
const Car = require('../models/Car');
const Pin = require('../models/Pin');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

class ListingController {
    // Get all listings (Public)
    static async getAllListings(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            // For now, we'll use search with no filters to get all approved listings
            const listings = await Listing.search({});
            const totalCount = listings.length;

            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedListings = listings.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: {
                    listings: paginatedListings,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalCount / limitNum),
                        totalItems: totalCount,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get all listings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get listings',
                error: error.message
            });
        }
    }

    // Get listing by ID (Public)
    static async getListingById(req, res) {
        try {
            const { listingId } = req.params;
            const listing = await Listing.findById(parseInt(listingId));

            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            res.json({
                success: true,
                data: listing
            });
        } catch (error) {
            console.error('Get listing by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get listing',
                error: error.message
            });
        }
    }

    // Search listings (Public)
    static async searchListings(req, res) {
        try {
            const filters = req.query;
            const listings = await Listing.search(filters);

            res.json({
                success: true,
                data: listings
            });
        } catch (error) {
            console.error('Search listings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search listings',
                error: error.message
            });
        }
    }

    // Get user's listings (Protected)
    static async getUserListings(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const userId = req.user.userId;

            const listings = await Listing.getByUserId(userId, pageNum, limitNum);

            res.json({
                success: true,
                data: {
                    listings,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(listings.length / limitNum),
                        totalItems: listings.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get user listings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user listings',
                error: error.message
            });
        }
    }

    // Create listing (Protected)
    static async createListing(req, res) {
        try {
            const { carId, pinId, listingType, title, description, price } = req.body;
            const userId = req.user.userId;

            // Validate that either carId or pinId is provided based on listingType
            if (listingType === 'Car' && !carId) {
                return res.status(400).json({
                    success: false,
                    message: 'Car ID is required for car listings'
                });
            }

            if (listingType === 'Pin' && !pinId) {
                return res.status(400).json({
                    success: false,
                    message: 'Pin ID is required for pin listings'
                });
            }

            // Verify car/pin exists
            if (listingType === 'Car') {
                const car = await Car.findById(carId);
                if (!car) {
                    return res.status(400).json({
                        success: false,
                        message: 'Car not found'
                    });
                }
            } else if (listingType === 'Pin') {
                const pin = await Pin.findById(pinId);
                if (!pin) {
                    return res.status(400).json({
                        success: false,
                        message: 'Pin not found'
                    });
                }
            }

            const listingData = {
                userId,
                carId: listingType === 'Car' ? carId : null,
                pinId: listingType === 'Pin' ? pinId : null,
                listingType,
                title,
                description,
                price,
                images: req.files ? JSON.stringify(req.files.map(file => file.path)) : null
            };

            const listing = await Listing.create(listingData);

            res.status(201).json({
                success: true,
                message: 'Listing created successfully',
                data: listing
            });
        } catch (error) {
            console.error('Create listing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create listing',
                error: error.message
            });
        }
    }

    // Update listing (Protected - owner only)
    static async updateListing(req, res) {
        try {
            const { listingId } = req.params;
            const updateData = req.body;
            const userId = req.user.userId;

            // Check if listing exists and belongs to user
            const existingListing = await Listing.findById(parseInt(listingId));
            if (!existingListing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            if (existingListing.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own listings'
                });
            }

            // Add images if provided
            if (req.files && req.files.length > 0) {
                updateData.images = JSON.stringify(req.files.map(file => file.path));
            }

            const updatedListing = await Listing.update(parseInt(listingId), updateData);

            res.json({
                success: true,
                message: 'Listing updated successfully',
                data: updatedListing
            });
        } catch (error) {
            console.error('Update listing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update listing',
                error: error.message
            });
        }
    }

    // Delete listing (Protected - owner only)
    static async deleteListing(req, res) {
        try {
            const { listingId } = req.params;
            const userId = req.user.userId;

            // Check if listing exists and belongs to user
            const existingListing = await Listing.findById(parseInt(listingId));
            if (!existingListing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            if (existingListing.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete your own listings'
                });
            }

            const deleted = await Listing.delete(parseInt(listingId));

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Listing deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete listing'
                });
            }
        } catch (error) {
            console.error('Delete listing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete listing',
                error: error.message
            });
        }
    }

    // Get pending listings for approval (Admin only)
    static async getPendingListings(req, res) {
        try {
            const listings = await Listing.getPendingApproval();

            res.json({
                success: true,
                data: listings
            });
        } catch (error) {
            console.error('Get pending listings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get pending listings',
                error: error.message
            });
        }
    }

    // Approve/Reject listing (Admin only)
    static async updateListingApproval(req, res) {
        try {
            const { listingId } = req.params;
            const { approved } = req.body;

            // Check if listing exists
            const existingListing = await Listing.findById(parseInt(listingId));
            if (!existingListing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            const updatedListing = await Listing.update(parseInt(listingId), { approved: approved ? 1 : 0 });

            res.json({
                success: true,
                message: `Listing ${approved ? 'approved' : 'rejected'} successfully`,
                data: updatedListing
            });
        } catch (error) {
            console.error('Update listing approval error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update listing approval',
                error: error.message
            });
        }
    }
}

module.exports = ListingController;

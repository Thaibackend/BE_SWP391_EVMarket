const Listing = require('../models/Listing');
const Car = require('../models/Car');
const Pin = require('../models/Pin');
const Brand = require('../models/Brand');
const { sql } = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

class ListingController {
    // Get approved listings (Public - only approved listings)
    static async getApprovedListings(req, res) {
        try {
            const { page = 1, limit = 10, searchTerm, listingType, minPrice, maxPrice } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            // Search with filters for approved listings only
            const filters = {
                searchTerm,
                listingType,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
            };

            const listings = await Listing.search(filters);
            // Filter only approved listings
            const approvedListings = listings.filter(listing => listing.approved === true);
            const totalCount = approvedListings.length;

            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedListings = approvedListings.slice(startIndex, endIndex);

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
            console.error('Get approved listings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get approved listings',
                error: error.message
            });
        }
    }

    // Get pending listings for current user
    static async getPendingListings(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const userId = req.user.userId;

            console.log('=== GET PENDING LISTINGS DEBUG ===');
            console.log('UserId:', userId);
            console.log('Page:', pageNum, 'Limit:', limitNum);

            const pool = require('../config/database').getPool();
            const request = pool.request();
            
            const offset = (pageNum - 1) * limitNum;
            request.input('userId', sql.Int, userId);
            request.input('offset', sql.Int, offset);
            request.input('limit', sql.Int, limitNum);

            // First, let's check if user has any listings at all
            const checkRequest = pool.request();
            checkRequest.input('userId', sql.Int, userId);
            const checkResult = await checkRequest.query(`
                SELECT COUNT(*) as totalCount, 
                       SUM(CASE WHEN (Approved = 0 OR Approved IS NULL) THEN 1 ELSE 0 END) as pendingCount
                FROM Listing 
                WHERE UserId = @userId
            `);

            console.log('User listings check:', checkResult.recordset[0]);

            // Get pending listings for current user
            const result = await request.query(`
                SELECT l.*, c.Model as CarModel, c.Year as CarYear, c.BatteryCapacity, c.Kilometers,
                       p.Model as PinModel, p.Capacity as PinCapacity, p.ManufactureYear,
                       b.BrandName
                FROM Listing l
                LEFT JOIN Car c ON l.CarId = c.CarId
                LEFT JOIN Pin p ON l.PinId = p.PinId
                LEFT JOIN Brand b ON (c.BrandId = b.BrandId OR p.BrandId = b.BrandId)
                WHERE l.UserId = @userId AND (l.Approved = 0 OR l.Approved IS NULL)
                ORDER BY l.CreatedDate DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `);

            console.log('Pending listings found:', result.recordset.length);
            console.log('Pending listings data:', result.recordset);

            // Get total count for pagination
            const countRequest = pool.request();
            countRequest.input('userId', sql.Int, userId);
            const countResult = await countRequest.query(`
                SELECT COUNT(*) as totalCount
                FROM Listing l
                WHERE l.UserId = @userId AND (l.Approved = 0 OR l.Approved IS NULL)
            `);

            const totalCount = countResult.recordset[0].totalCount;
            console.log('Total pending count:', totalCount);

            if (result.recordset.length === 0 && totalCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No pending listings found for this user'
                });
            }

            res.json({
                success: true,
                data: {
                    listings: result.recordset,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalCount / limitNum),
                        totalItems: totalCount,
                        itemsPerPage: limitNum
                    }
                }
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

    // Get all listings for admin
    static async getAllListingsAdmin(req, res) {
        try {
            const { page = 1, limit = 20, status } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            // Get all listings with optional status filter
            const listings = await Listing.search({});
            let filteredListings = listings;

            if (status) {
                if (status === 'Pending') {
                    filteredListings = listings.filter(listing => listing.approved === false);
                } else if (status === 'Approved') {
                    filteredListings = listings.filter(listing => listing.approved === true);
                }
            }

            const totalCount = filteredListings.length;
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            const paginatedListings = filteredListings.slice(startIndex, endIndex);

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
            console.error('Get all listings admin error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get all listings',
                error: error.message
            });
        }
    }

    // Approve listing (Admin only)
    static async approveListing(req, res) {
        try {
            const { listingId } = req.params;
            const listing = await Listing.findById(parseInt(listingId));

            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            // Update listing to approved
            const updatedListing = await Listing.update(parseInt(listingId), { approved: true });

            res.json({
                success: true,
                message: 'Listing approved successfully',
                data: {
                    ...updatedListing,
                    status: 'Approved',
                    approved: true
                }
            });
        } catch (error) {
            console.error('Approve listing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve listing',
                error: error.message
            });
        }
    }

    // Reject listing (Admin only)
    static async rejectListing(req, res) {
        try {
            const { listingId } = req.params;
            const listing = await Listing.findById(parseInt(listingId));

            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            // Update listing to rejected (or delete it)
            const updatedListing = await Listing.update(parseInt(listingId), { approved: false, status: 'Rejected' });

            res.json({
                success: true,
                message: 'Listing rejected successfully',
                data: {
                    ...updatedListing,
                    status: 'Rejected',
                    approved: false
                }
            });
        } catch (error) {
            console.error('Reject listing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reject listing',
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
            // Debug: Log the request body
            console.log('Request body:', req.body);
            console.log('Request files:', req.files);
            
            // Parse form data properly
            const { carId, pinId, listingType, title, description, price } = req.body;
            
            // Convert string values to appropriate types
            const listingData = {
                carId: carId ? parseInt(carId) : null,
                pinId: pinId ? parseInt(pinId) : null,
                listingType: listingType,
                title: title,
                description: description,
                price: parseFloat(price)
            };
            const userId = req.user.userId;

            // Validate required fields
            if (!listingData.listingType) {
                return res.status(400).json({
                    success: false,
                    message: 'Listing type is required'
                });
            }

            if (!listingData.title) {
                return res.status(400).json({
                    success: false,
                    message: 'Title is required'
                });
            }

            if (!listingData.description) {
                return res.status(400).json({
                    success: false,
                    message: 'Description is required'
                });
            }

            if (!listingData.price) {
                return res.status(400).json({
                    success: false,
                    message: 'Price is required'
                });
            }

            // Validate that either carId or pinId is provided based on listingType
            if (listingData.listingType === 'Car' && !listingData.carId) {
                return res.status(400).json({
                    success: false,
                    message: 'Car ID is required for car listings'
                });
            }

            if (listingData.listingType === 'Pin' && !listingData.pinId) {
                return res.status(400).json({
                    success: false,
                    message: 'Pin ID is required for pin listings'
                });
            }

            // Auto-create Car/Pin if not exists
            let finalCarId = null;
            let finalPinId = null;

            // Ensure default brand exists
            let defaultBrand = await Brand.findByName('Tesla');
            if (!defaultBrand) {
                defaultBrand = await Brand.create({ brandName: 'Tesla' });
                console.log('Auto-created default brand:', defaultBrand.brandId);
            }

            if (listingData.listingType === 'Car') {
                // Check if car exists
                let car = await Car.findById(listingData.carId);
                
                if (!car) {
                    // Auto-create car with basic info
                    const carData = {
                        brandId: defaultBrand.brandId,
                        model: `Model ${listingData.carId}`,
                        year: 2020,
                        batteryCapacity: 75,
                        kilometers: 0,
                        description: `Auto-created car for listing`,
                        status: 'Active'
                    };
                    car = await Car.create(carData);
                    console.log('Auto-created car:', car.carId);
                }
                finalCarId = car.carId;
            } else if (listingData.listingType === 'Pin') {
                // Check if pin exists
                let pin = await Pin.findById(listingData.pinId);
                
                if (!pin) {
                    // Auto-create pin with basic info
                    const pinData = {
                        brandId: defaultBrand.brandId,
                        capacity: 100,
                        model: `Powerwall ${listingData.pinId}`,
                        status: 'Active',
                        manufactureYear: 2022,
                        description: `Auto-created pin for listing`
                    };
                    pin = await Pin.create(pinData);
                    console.log('Auto-created pin:', pin.pinId);
                }
                finalPinId = pin.pinId;
            }

            const finalListingData = {
                userId,
                carId: finalCarId,
                pinId: finalPinId,
                listingType: listingData.listingType,
                title: listingData.title,
                description: listingData.description,
                price: listingData.price,
                images: req.files ? JSON.stringify(req.files.map(file => file.path)) : null,
                status: 'Pending',
                approved: false  // Set to false for pending approval
            };

            const listing = await Listing.create(finalListingData);

            res.status(201).json({
                success: true,
                message: 'Listing created successfully - Status: Pending (Waiting for admin approval)',
                data: {
                    ...listing,
                    status: 'Pending',
                    approved: false,
                    message: 'Your listing is now pending admin approval. You can view it in your pending listings.'
                }
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

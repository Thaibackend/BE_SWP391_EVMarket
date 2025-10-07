const Auction = require('../models/Auction');
const Listing = require('../models/Listing');
const { authenticateToken } = require('../middleware/auth');

class AuctionController {
    // Get auction history for a listing (Public)
    static async getAuctionHistory(req, res) {
        try {
            const { listingId } = req.params;
            const history = await Auction.getAuctionHistory(parseInt(listingId));

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            console.error('Get auction history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get auction history',
                error: error.message
            });
        }
    }

    // Get highest bid for a listing (Public)
    static async getHighestBid(req, res) {
        try {
            const { listingId } = req.params;
            const highestBid = await Auction.getHighestBid(parseInt(listingId));

            res.json({
                success: true,
                data: highestBid
            });
        } catch (error) {
            console.error('Get highest bid error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get highest bid',
                error: error.message
            });
        }
    }

    // Place a bid (Protected)
    static async placeBid(req, res) {
        try {
            const { listingId } = req.params;
            const { bidPrice } = req.body;
            const userId = req.user.userId;

            // Check if listing exists and is approved
            const listing = await Listing.findById(parseInt(listingId));
            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            if (!listing.approved) {
                return res.status(400).json({
                    success: false,
                    message: 'Listing is not approved yet'
                });
            }

            if (listing.status !== 'Active') {
                return res.status(400).json({
                    success: false,
                    message: 'Listing is not active'
                });
            }

            // Check if user is not the seller
            if (listing.userId === userId) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot bid on your own listing'
                });
            }

            // Get current highest bid
            const currentHighestBid = await Auction.getHighestBid(parseInt(listingId));

            // Validate bid price
            if (currentHighestBid && bidPrice <= currentHighestBid.bidPrice) {
                return res.status(400).json({
                    success: false,
                    message: `Bid must be higher than current highest bid of $${currentHighestBid.bidPrice}`
                });
            }

            if (bidPrice <= listing.price) {
                return res.status(400).json({
                    success: false,
                    message: `Bid must be higher than starting price of $${listing.price}`
                });
            }

            const auctionData = {
                listingId: parseInt(listingId),
                userId,
                bidPrice
            };

            const auction = await Auction.create(auctionData);

            res.status(201).json({
                success: true,
                message: 'Bid placed successfully',
                data: auction
            });
        } catch (error) {
            console.error('Place bid error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to place bid',
                error: error.message
            });
        }
    }

    // Get user's bids (Protected)
    static async getUserBids(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const userId = req.user.userId;

            const bids = await Auction.getByUserId(userId, pageNum, limitNum);

            res.json({
                success: true,
                data: {
                    bids,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(bids.length / limitNum),
                        totalItems: bids.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get user bids error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user bids',
                error: error.message
            });
        }
    }

    // Get bids for a specific listing (Protected - seller only)
    static async getListingBids(req, res) {
        try {
            const { listingId } = req.params;
            const userId = req.user.userId;

            // Check if listing exists and belongs to user
            const listing = await Listing.findById(parseInt(listingId));
            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            if (listing.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view bids for your own listings'
                });
            }

            const bids = await Auction.getByListingId(parseInt(listingId));

            res.json({
                success: true,
                data: bids
            });
        } catch (error) {
            console.error('Get listing bids error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get listing bids',
                error: error.message
            });
        }
    }

    // End auction (Protected - seller only)
    static async endAuction(req, res) {
        try {
            const { listingId } = req.params;
            const userId = req.user.userId;

            // Check if listing exists and belongs to user
            const listing = await Listing.findById(parseInt(listingId));
            if (!listing) {
                return res.status(404).json({
                    success: false,
                    message: 'Listing not found'
                });
            }

            if (listing.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only end auctions for your own listings'
                });
            }

            // Get highest bid
            const highestBid = await Auction.getHighestBid(parseInt(listingId));
            if (!highestBid) {
                return res.status(400).json({
                    success: false,
                    message: 'No bids found for this listing'
                });
            }

            // Update listing status
            await Listing.update(parseInt(listingId), { status: 'Sold' });

            // Update auction status
            await Auction.updateStatus(highestBid.auctionId, 'Won');

            res.json({
                success: true,
                message: 'Auction ended successfully',
                data: {
                    winner: highestBid,
                    finalPrice: highestBid.bidPrice
                }
            });
        } catch (error) {
            console.error('End auction error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to end auction',
                error: error.message
            });
        }
    }
}

module.exports = AuctionController;

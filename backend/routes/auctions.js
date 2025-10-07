const express = require('express');
const router = express.Router();
const AuctionController = require('../controllers/auctionController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, auctionSchema } = require('../middleware/validation');

// Public routes
router.get('/:listingId/history', AuctionController.getAuctionHistory);
router.get('/:listingId/highest-bid', AuctionController.getHighestBid);

// Protected routes
router.post('/:listingId/bid', authenticateToken, validateRequest(auctionSchema), AuctionController.placeBid);
router.get('/user/my-bids', authenticateToken, AuctionController.getUserBids);
router.get('/:listingId/bids', authenticateToken, AuctionController.getListingBids);
router.post('/:listingId/end', authenticateToken, AuctionController.endAuction);

module.exports = router;

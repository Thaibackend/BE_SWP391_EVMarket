const express = require('express');
const router = express.Router();
const AuctionController = require('../controllers/auctionController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, auctionSchema } = require('../middleware/validation');

/**
 * @swagger
 * /api/auctions/{listingId}/history:
 *   get:
 *     tags: [Auctions]
 *     summary: Get auction history (Public)
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Auction history retrieved successfully
 */
router.get('/:listingId/history', AuctionController.getAuctionHistory);

/**
 * @swagger
 * /api/auctions/{listingId}/highest-bid:
 *   get:
 *     tags: [Auctions]
 *     summary: Get highest bid (Public)
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Highest bid information
 */
router.get('/:listingId/highest-bid', AuctionController.getHighestBid);

/**
 * @swagger
 * /api/auctions/{listingId}/bid:
 *   post:
 *     tags: [Auctions]
 *     summary: Place a bid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidPrice
 *             properties:
 *               bidPrice:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *       400:
 *         description: Invalid bid amount or cannot bid on own listing
 *       401:
 *         description: Unauthorized
 */
router.post('/:listingId/bid', authenticateToken, validateRequest(auctionSchema), AuctionController.placeBid);

/**
 * @swagger
 * /api/auctions/user/my-bids:
 *   get:
 *     tags: [Auctions]
 *     summary: Get current user's bids
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User's bids retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/user/my-bids', authenticateToken, AuctionController.getUserBids);

/**
 * @swagger
 * /api/auctions/{listingId}/bids:
 *   get:
 *     tags: [Auctions]
 *     summary: Get all bids for listing (Seller only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All bids for the listing
 *       403:
 *         description: You can only view bids for your own listings
 */
router.get('/:listingId/bids', authenticateToken, AuctionController.getListingBids);

/**
 * @swagger
 * /api/auctions/{listingId}/end:
 *   post:
 *     tags: [Auctions]
 *     summary: End auction (Seller only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Auction ended successfully
 *       403:
 *         description: You can only end auctions for your own listings
 */
router.post('/:listingId/end', authenticateToken, AuctionController.endAuction);

module.exports = router;

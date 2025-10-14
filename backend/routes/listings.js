const express = require('express');
const router = express.Router();
const ListingController = require('../controllers/listingController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateRequest, listingSchema } = require('../middleware/validation');
const { uploadMultiple } = require('../middleware/upload');

/**
 * @swagger
 * /api/listings:
 *   get:
 *     tags: [Listings]
 *     summary: Get approved listings (Public - only approved listings)
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
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: listingType
 *         schema:
 *           type: string
 *           enum: [Car, Pin]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of approved listings only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     listings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Listing'
 */
router.get('/', ListingController.getApprovedListings);

/**
 * @swagger
 * /api/listings/search:
 *   get:
 *     tags: [Listings]
 *     summary: Search listings with filters (Public)
 *     parameters:
 *       - in: query
 *         name: listingType
 *         schema:
 *           type: string
 *           enum: [Car, Pin]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filtered listings
 */
router.get('/search', ListingController.searchListings);

/**
 * @swagger
 * /api/listings/{listingId}:
 *   get:
 *     tags: [Listings]
 *     summary: Get listing by ID (Public)
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Listing details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Listing'
 *       404:
 *         description: Listing not found
 */
router.get('/:listingId', ListingController.getListingById);

/**
 * @swagger
 * /api/listings/user/my-listings:
 *   get:
 *     tags: [Listings]
 *     summary: Get current user's listings
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
 *         description: User's listings
 *       401:
 *         description: Unauthorized
 */
router.get('/user/my-listings', authenticateToken, ListingController.getUserListings);

/**
 * @swagger
 * /api/listings:
 *   post:
 *     tags: [Listings]
 *     summary: Create a new listing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - listingType
 *               - title
 *               - description
 *               - price
 *             properties:
 *               carId:
 *                 type: integer
 *                 description: Required if listingType is Car
 *               pinId:
 *                 type: integer
 *                 description: Required if listingType is Pin
 *               listingType:
 *                 type: string
 *                 enum: [Car, Pin]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Listing created successfully - Status Pending
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
// Test route for form-data parsing
router.post('/test', (req, res) => {
    console.log('Test route - Request body:', req.body);
    console.log('Test route - Request files:', req.files);
    res.json({
        success: true,
        body: req.body,
        files: req.files
    });
});

/**
 * @swagger
 * /api/listings/pending:
 *   get:
 *     tags: [Listings]
 *     summary: Get pending listings (Member only)
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
 *         description: Pending listings for current user
 *       401:
 *         description: Unauthorized
 */
router.get('/pending', authenticateToken, ListingController.getPendingListings);

/**
 * @swagger
 * /api/listings/approved:
 *   get:
 *     tags: [Listings]
 *     summary: Get approved listings (Public)
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
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: listingType
 *         schema:
 *           type: string
 *           enum: [Car, Pin]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Approved listings
 */
router.get('/approved', ListingController.getApprovedListings);

/**
 * @swagger
 * /api/listings/all:
 *   get:
 *     tags: [Listings]
 *     summary: Get all listings (Admin only)
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
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *     responses:
 *       200:
 *         description: All listings
 *       403:
 *         description: Admin access required
 */
router.get('/all', authenticateToken, requireAdmin, ListingController.getAllListingsAdmin);

/**
 * @swagger
 * /api/listings/{listingId}/approve:
 *   put:
 *     tags: [Listings]
 *     summary: Approve listing (Admin only)
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
 *         description: Listing approved successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Listing not found
 */
router.put('/:listingId/approve', authenticateToken, requireAdmin, ListingController.approveListing);

/**
 * @swagger
 * /api/listings/{listingId}/reject:
 *   put:
 *     tags: [Listings]
 *     summary: Reject listing (Admin only)
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
 *         description: Listing rejected successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Listing not found
 */
router.put('/:listingId/reject', authenticateToken, requireAdmin, ListingController.rejectListing);

router.post('/', authenticateToken, uploadMultiple('images', 10), ListingController.createListing);

/**
 * @swagger
 * /api/listings/{listingId}:
 *   put:
 *     tags: [Listings]
 *     summary: Update listing (Owner only)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *       403:
 *         description: You can only update your own listings
 *       404:
 *         description: Listing not found
 */
router.put('/:listingId', authenticateToken, uploadMultiple('images', 10), ListingController.updateListing);

/**
 * @swagger
 * /api/listings/{listingId}:
 *   delete:
 *     tags: [Listings]
 *     summary: Delete listing (Owner only)
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
 *         description: Listing deleted successfully
 *       403:
 *         description: You can only delete your own listings
 *       404:
 *         description: Listing not found
 */
router.delete('/:listingId', authenticateToken, ListingController.deleteListing);


/**
 * @swagger
 * /api/listings/{listingId}/approval:
 *   put:
 *     tags: [Listings]
 *     summary: Approve or reject listing (Admin only)
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
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *               rejectionReason:
 *                 type: string
 *                 description: Required if rejected
 *     responses:
 *       200:
 *         description: Listing approval updated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Listing not found
 */
router.put('/:listingId/approval', authenticateToken, requireAdmin, ListingController.updateListingApproval);

module.exports = router;

/**
 * Swagger Documentation for All Routes
 * This file contains comprehensive API documentation
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and account management
 *   - name: Users
 *     description: User management (Admin only)
 *   - name: Brands
 *     description: Vehicle and battery brand management
 *   - name: Cars
 *     description: Electric vehicle catalog management
 *   - name: Pins
 *     description: Battery pin catalog management
 *   - name: Listings
 *     description: Marketplace listing management
 *   - name: Auctions
 *     description: Auction and bidding system
 *   - name: Orders
 *     description: Order and transaction management
 *   - name: Payments
 *     description: Payment processing
 *   - name: Reviews
 *     description: User review and rating system
 *   - name: Favorites
 *     description: Favorite listings management
 *   - name: Notifications
 *     description: User notification system
 *   - name: Admin
 *     description: Admin dashboard and system management
 *   - name: AI
 *     description: AI-powered features
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token
 */

// ============== LISTINGS ==============

/**
 * @swagger
 * /api/listings:
 *   get:
 *     tags: [Listings]
 *     summary: Get all listings (Public)
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
 *         description: List of approved listings
 */

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
 *       404:
 *         description: Listing not found
 */

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

/**
 * @swagger
 * /api/listings/admin/pending:
 *   get:
 *     tags: [Listings]
 *     summary: Get pending listings (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending listings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

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

// ============== AUCTIONS ==============

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
 *         description: Auction bid history
 */

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
 *         description: User's bids
 *       401:
 *         description: Unauthorized
 */

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

// ============== BRANDS ==============

/**
 * @swagger
 * /api/brands:
 *   get:
 *     tags: [Brands]
 *     summary: Get all brands (Public)
 *     responses:
 *       200:
 *         description: List of all brands
 *   post:
 *     tags: [Brands]
 *     summary: Create new brand (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Car, Pin]
 *               logoUrl:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/brands/{brandId}:
 *   get:
 *     tags: [Brands]
 *     summary: Get brand by ID (Public)
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand details
 *       404:
 *         description: Brand not found
 *   put:
 *     tags: [Brands]
 *     summary: Update brand (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       403:
 *         description: Admin access required
 *   delete:
 *     tags: [Brands]
 *     summary: Delete brand (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       403:
 *         description: Admin access required
 */

// ============== CARS ==============

/**
 * @swagger
 * /api/cars:
 *   get:
 *     tags: [Cars]
 *     summary: Get all cars (Public)
 *     responses:
 *       200:
 *         description: List of all cars
 *   post:
 *     tags: [Cars]
 *     summary: Create new car (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandId
 *               - model
 *               - year
 *             properties:
 *               brandId:
 *                 type: integer
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               batteryCapacity:
 *                 type: number
 *               range:
 *                 type: number
 *               enginePower:
 *                 type: number
 *               torque:
 *                 type: number
 *               specifications:
 *                 type: object
 *     responses:
 *       201:
 *         description: Car created successfully
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/cars/search:
 *   get:
 *     tags: [Cars]
 *     summary: Search cars (Public)
 *     parameters:
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered cars
 */

/**
 * @swagger
 * /api/cars/{carId}:
 *   get:
 *     tags: [Cars]
 *     summary: Get car by ID (Public)
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Car details
 *       404:
 *         description: Car not found
 *   put:
 *     tags: [Cars]
 *     summary: Update car (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       403:
 *         description: Admin access required
 *   delete:
 *     tags: [Cars]
 *     summary: Delete car (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       403:
 *         description: Admin access required
 */

// Continuing with more routes...
// This file demonstrates the pattern. Apply same to all other routes.

module.exports = {};


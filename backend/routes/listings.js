const express = require('express');
const router = express.Router();
const ListingController = require('../controllers/listingController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateRequest, listingSchema } = require('../middleware/validation');
const { uploadMultiple } = require('../middleware/upload');

// Public routes
router.get('/', ListingController.getAllListings);
router.get('/search', ListingController.searchListings);
router.get('/:listingId', ListingController.getListingById);

// Protected routes
router.get('/user/my-listings', authenticateToken, ListingController.getUserListings);
router.post('/', authenticateToken, uploadMultiple('images', 10), validateRequest(listingSchema), ListingController.createListing);
router.put('/:listingId', authenticateToken, uploadMultiple('images', 10), ListingController.updateListing);
router.delete('/:listingId', authenticateToken, ListingController.deleteListing);

// Admin only routes
router.get('/admin/pending', authenticateToken, requireAdmin, ListingController.getPendingListings);
router.put('/:listingId/approval', authenticateToken, requireAdmin, ListingController.updateListingApproval);

module.exports = router;

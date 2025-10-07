const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, reviewSchema } = require('../middleware/validation');

// Public routes
router.get('/user/:userId', ReviewController.getUserReviews);
router.get('/user/:userId/rating', ReviewController.getUserRating);

// Protected routes
router.post('/', authenticateToken, validateRequest(reviewSchema), ReviewController.createReview);
router.get('/order/:orderId', authenticateToken, ReviewController.getOrderReviews);
router.put('/:reviewId', authenticateToken, ReviewController.updateReview);
router.delete('/:reviewId', authenticateToken, ReviewController.deleteReview);

// Admin only routes
router.get('/', authenticateToken, requireAdmin, ReviewController.getAllReviews);

module.exports = router;

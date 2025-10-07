const Review = require('../models/Review');
const Order = require('../models/Order');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

class ReviewController {
    // Create review (Protected)
    static async createReview(req, res) {
        try {
            const { orderId, revieweeId, rating, comment } = req.body;
            const reviewerId = req.user.userId;

            // Check if order exists and belongs to user
            const order = await Order.findById(parseInt(orderId));
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            if (order.buyerId !== reviewerId && order.sellerId !== reviewerId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only review orders you participated in'
                });
            }

            // Check if order is completed
            if (order.orderStatus !== 'Completed') {
                return res.status(400).json({
                    success: false,
                    message: 'You can only review completed orders'
                });
            }

            // Check if reviewee is valid (must be the other party in the order)
            if (revieweeId !== order.buyerId && revieweeId !== order.sellerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reviewee for this order'
                });
            }

            // Check if user is not reviewing themselves
            if (revieweeId === reviewerId) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot review yourself'
                });
            }

            // Check if review already exists for this order and reviewee
            const existingReviews = await Review.getByOrderId(parseInt(orderId));
            const existingReview = existingReviews.find(review => 
                review.reviewerId === reviewerId && review.revieweeId === parseInt(revieweeId)
            );

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reviewed this user for this order'
                });
            }

            const reviewData = {
                orderId: parseInt(orderId),
                reviewerId,
                revieweeId: parseInt(revieweeId),
                rating,
                comment
            };

            const review = await Review.create(reviewData);

            res.status(201).json({
                success: true,
                message: 'Review created successfully',
                data: review
            });
        } catch (error) {
            console.error('Create review error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create review',
                error: error.message
            });
        }
    }

    // Get reviews for a user (Public)
    static async getUserReviews(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10, type = 'reviewee' } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            const reviews = await Review.getByUserId(parseInt(userId), type, pageNum, limitNum);

            res.json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(reviews.length / limitNum),
                        totalItems: reviews.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get user reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user reviews',
                error: error.message
            });
        }
    }

    // Get user's average rating (Public)
    static async getUserRating(req, res) {
        try {
            const { userId } = req.params;
            const ratingStats = await Review.getAverageRating(parseInt(userId));

            res.json({
                success: true,
                data: ratingStats
            });
        } catch (error) {
            console.error('Get user rating error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user rating',
                error: error.message
            });
        }
    }

    // Get reviews for an order (Protected - order participants only)
    static async getOrderReviews(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.userId;

            // Check if order exists and belongs to user
            const order = await Order.findById(parseInt(orderId));
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            if (order.buyerId !== userId && order.sellerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view reviews for your own orders'
                });
            }

            const reviews = await Review.getByOrderId(parseInt(orderId));

            res.json({
                success: true,
                data: reviews
            });
        } catch (error) {
            console.error('Get order reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get order reviews',
                error: error.message
            });
        }
    }

    // Update review (Protected - reviewer only)
    static async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.userId;

            // Check if review exists and belongs to user
            const userReviews = await Review.getByUserId(userId, 'reviewer');
            const targetReview = userReviews.find(review => review.reviewId === parseInt(reviewId));

            if (!targetReview) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found or you do not have permission to update it'
                });
            }

            const updateData = {};
            if (rating !== undefined) updateData.rating = rating;
            if (comment !== undefined) updateData.comment = comment;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            const updatedReview = await Review.update(parseInt(reviewId), updateData);

            res.json({
                success: true,
                message: 'Review updated successfully',
                data: updatedReview
            });
        } catch (error) {
            console.error('Update review error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update review',
                error: error.message
            });
        }
    }

    // Delete review (Protected - reviewer only)
    static async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user.userId;

            // Check if review exists and belongs to user
            const userReviews = await Review.getByUserId(userId, 'reviewer');
            const targetReview = userReviews.find(review => review.reviewId === parseInt(reviewId));

            if (!targetReview) {
                return res.status(404).json({
                    success: false,
                    message: 'Review not found or you do not have permission to delete it'
                });
            }

            const deleted = await Review.delete(parseInt(reviewId));

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Review deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete review'
                });
            }
        } catch (error) {
            console.error('Delete review error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete review',
                error: error.message
            });
        }
    }

    // Get all reviews (Admin only)
    static async getAllReviews(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            const reviews = await Review.getAll(pageNum, limitNum);

            res.json({
                success: true,
                data: {
                    reviews,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(reviews.length / limitNum),
                        totalItems: reviews.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get all reviews error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get reviews',
                error: error.message
            });
        }
    }
}

module.exports = ReviewController;

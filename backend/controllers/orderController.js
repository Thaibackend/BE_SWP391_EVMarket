const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Listing = require('../models/Listing');
const Auction = require('../models/Auction');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

class OrderController {
    // Create order (Protected)
    static async createOrder(req, res) {
        try {
            const { listingId, orderType } = req.body;
            const buyerId = req.user.userId;

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
                    message: 'Listing is not available'
                });
            }

            // Check if user is not the seller
            if (listing.userId === buyerId) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot buy your own listing'
                });
            }

            let finalPrice = listing.price;

            // For auction orders, get the highest bid
            if (orderType === 'Auction') {
                const highestBid = await Auction.getHighestBid(parseInt(listingId));
                if (!highestBid) {
                    return res.status(400).json({
                        success: false,
                        message: 'No bids found for this auction'
                    });
                }

                if (highestBid.userId !== buyerId) {
                    return res.status(400).json({
                        success: false,
                        message: 'You are not the highest bidder'
                    });
                }

                finalPrice = highestBid.bidPrice;
            }

            const orderData = {
                listingId: parseInt(listingId),
                buyerId,
                sellerId: listing.userId,
                orderType,
                orderStatus: 'Pending'
            };

            const order = await Order.create(orderData);

            // Update listing status
            await Listing.update(parseInt(listingId), { status: 'Sold' });

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: {
                    order,
                    finalPrice
                }
            });
        } catch (error) {
            console.error('Create order error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create order',
                error: error.message
            });
        }
    }

    // Get order by ID (Protected)
    static async getOrderById(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.userId;

            const order = await Order.findById(parseInt(orderId));
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Check if user is buyer or seller
            if (order.buyerId !== userId && order.sellerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view your own orders'
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            console.error('Get order by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get order',
                error: error.message
            });
        }
    }

    // Get user orders (Protected)
    static async getUserOrders(req, res) {
        try {
            const { page = 1, limit = 10, type = 'all' } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const userId = req.user.userId;

            const orders = await Order.getByUserId(userId, type, pageNum, limitNum);

            res.json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(orders.length / limitNum),
                        totalItems: orders.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get user orders error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user orders',
                error: error.message
            });
        }
    }

    // Update order status (Protected - buyer/seller only)
    static async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            const userId = req.user.userId;

            const order = await Order.findById(parseInt(orderId));
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Check if user is buyer or seller
            if (order.buyerId !== userId && order.sellerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own orders'
                });
            }

            // Validate status transitions
            const validTransitions = {
                'Pending': ['Confirmed', 'Cancelled'],
                'Confirmed': ['Shipped', 'Cancelled'],
                'Shipped': ['Delivered'],
                'Delivered': ['Completed'],
                'Cancelled': [],
                'Completed': []
            };

            if (!validTransitions[order.orderStatus]?.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot change status from ${order.orderStatus} to ${status}`
                });
            }

            const updatedOrder = await Order.updateStatus(parseInt(orderId), status);

            res.json({
                success: true,
                message: 'Order status updated successfully',
                data: updatedOrder
            });
        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update order status',
                error: error.message
            });
        }
    }

    // Get all orders (Admin only)
    static async getAllOrders(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            const orders = await Order.getAll(pageNum, limitNum, status);

            res.json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(orders.length / limitNum),
                        totalItems: orders.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get all orders error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get orders',
                error: error.message
            });
        }
    }

    // Get order statistics (Admin only)
    static async getOrderStats(req, res) {
        try {
            const totalOrders = await Order.getTotalCount();
            const pendingOrders = await Order.getTotalCount('Pending');
            const completedOrders = await Order.getTotalCount('Completed');
            const cancelledOrders = await Order.getTotalCount('Cancelled');

            res.json({
                success: true,
                data: {
                    totalOrders,
                    pendingOrders,
                    completedOrders,
                    cancelledOrders,
                    activeOrders: totalOrders - completedOrders - cancelledOrders
                }
            });
        } catch (error) {
            console.error('Get order stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get order statistics',
                error: error.message
            });
        }
    }
}

module.exports = OrderController;

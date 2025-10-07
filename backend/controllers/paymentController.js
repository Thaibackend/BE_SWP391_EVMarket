const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

class PaymentController {
    // Create payment (Protected)
    static async createPayment(req, res) {
        try {
            const { orderId, amount, paymentMethod } = req.body;
            const userId = req.user.userId;

            // Check if order exists and belongs to user
            const order = await Order.findById(parseInt(orderId));
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            if (order.buyerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only make payments for your own orders'
                });
            }

            if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Payment can only be made for pending or confirmed orders'
                });
            }

            // Check if payment already exists for this order
            const existingPayments = await Payment.findByOrderId(parseInt(orderId));
            if (existingPayments.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment already exists for this order'
                });
            }

            const paymentData = {
                orderId: parseInt(orderId),
                userId,
                amount,
                paymentMethod
            };

            const payment = await Payment.create(paymentData);

            res.status(201).json({
                success: true,
                message: 'Payment created successfully',
                data: payment
            });
        } catch (error) {
            console.error('Create payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create payment',
                error: error.message
            });
        }
    }

    // Get payment by order ID (Protected)
    static async getPaymentByOrderId(req, res) {
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
                    message: 'You can only view payments for your own orders'
                });
            }

            const payments = await Payment.findByOrderId(parseInt(orderId));

            res.json({
                success: true,
                data: payments
            });
        } catch (error) {
            console.error('Get payment by order ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment',
                error: error.message
            });
        }
    }

    // Get user payments (Protected)
    static async getUserPayments(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const userId = req.user.userId;

            const payments = await Payment.getByUserId(userId, pageNum, limitNum);

            res.json({
                success: true,
                data: {
                    payments,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(payments.length / limitNum),
                        totalItems: payments.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get user payments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user payments',
                error: error.message
            });
        }
    }

    // Update payment status (Protected - buyer/seller only)
    static async updatePaymentStatus(req, res) {
        try {
            const { paymentId } = req.params;
            const { status } = req.body;
            const userId = req.user.userId;

            // Get payment details to check ownership
            const payment = await Payment.getByUserId(userId);
            const targetPayment = payment.find(p => p.paymentId === parseInt(paymentId));

            if (!targetPayment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found or you do not have permission to update it'
                });
            }

            const updatedPayment = await Payment.updateStatus(parseInt(paymentId), status);

            res.json({
                success: true,
                message: 'Payment status updated successfully',
                data: updatedPayment
            });
        } catch (error) {
            console.error('Update payment status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payment status',
                error: error.message
            });
        }
    }

    // Get all payments (Admin only)
    static async getAllPayments(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);

            const payments = await Payment.getAll(pageNum, limitNum, status);

            res.json({
                success: true,
                data: {
                    payments,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(payments.length / limitNum),
                        totalItems: payments.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get all payments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payments',
                error: error.message
            });
        }
    }

    // Get payment statistics (Admin only)
    static async getPaymentStats(req, res) {
        try {
            const completedStats = await Payment.getTotalAmount('Completed');
            const pendingStats = await Payment.getTotalAmount('Pending');

            res.json({
                success: true,
                data: {
                    completed: completedStats,
                    pending: pendingStats,
                    totalRevenue: completedStats.totalAmount || 0,
                    totalTransactions: (completedStats.totalCount || 0) + (pendingStats.totalCount || 0)
                }
            });
        } catch (error) {
            console.error('Get payment stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment statistics',
                error: error.message
            });
        }
    }
}

module.exports = PaymentController;

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, orderSchema } = require('../middleware/validation');

// Protected routes
router.post('/', authenticateToken, validateRequest(orderSchema), OrderController.createOrder);
router.get('/user/my-orders', authenticateToken, OrderController.getUserOrders);
router.get('/:orderId', authenticateToken, OrderController.getOrderById);
router.put('/:orderId/status', authenticateToken, OrderController.updateOrderStatus);

// Admin only routes
router.get('/', authenticateToken, requireAdmin, OrderController.getAllOrders);
router.get('/stats', authenticateToken, requireAdmin, OrderController.getOrderStats);

module.exports = router;

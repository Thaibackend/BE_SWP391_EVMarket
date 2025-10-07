const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, paymentSchema } = require('../middleware/validation');

// Protected routes
router.post('/', authenticateToken, validateRequest(paymentSchema), PaymentController.createPayment);
router.get('/order/:orderId', authenticateToken, PaymentController.getPaymentByOrderId);
router.get('/user/my-payments', authenticateToken, PaymentController.getUserPayments);
router.put('/:paymentId/status', authenticateToken, PaymentController.updatePaymentStatus);

// Admin only routes
router.get('/', authenticateToken, requireAdmin, PaymentController.getAllPayments);
router.get('/stats', authenticateToken, requireAdmin, PaymentController.getPaymentStats);

module.exports = router;

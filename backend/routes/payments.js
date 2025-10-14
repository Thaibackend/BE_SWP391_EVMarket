const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, paymentSchema } = require('../middleware/validation');

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [CreditCard, BankTransfer, DigitalWallet]
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, validateRequest(paymentSchema), PaymentController.createPayment);

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by order ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/order/:orderId', authenticateToken, PaymentController.getPaymentByOrderId);

/**
 * @swagger
 * /api/payments/user/my-payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get user payments
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
 *         description: User payments
 *       401:
 *         description: Unauthorized
 */
router.get('/user/my-payments', authenticateToken, PaymentController.getUserPayments);

/**
 * @swagger
 * /api/payments/{paymentId}/status:
 *   put:
 *     tags: [Payments]
 *     summary: Update payment status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Processing, Completed, Failed, Refunded]
 *     responses:
 *       200:
 *         description: Payment status updated
 *       401:
 *         description: Unauthorized
 */
router.put('/:paymentId/status', authenticateToken, PaymentController.updatePaymentStatus);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments (Admin only)
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
 *     responses:
 *       200:
 *         description: All payments
 *       403:
 *         description: Admin access required
 */
router.get('/', authenticateToken, requireAdmin, PaymentController.getAllPayments);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics
 *       403:
 *         description: Admin access required
 */
router.get('/stats', authenticateToken, requireAdmin, PaymentController.getPaymentStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const PinController = require('../controllers/pinController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, pinSchema } = require('../middleware/validation');

/**
 * @swagger
 * /api/pins:
 *   get:
 *     tags: [Pins]
 *     summary: Get all pins (Public)
 *     responses:
 *       200:
 *         description: List of all battery pins
 */
router.get('/', PinController.getAllPins);

/**
 * @swagger
 * /api/pins/search:
 *   get:
 *     tags: [Pins]
 *     summary: Search pins (Public)
 *     parameters:
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: number
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered pins
 */
router.get('/search', PinController.searchPins);

/**
 * @swagger
 * /api/pins/{pinId}:
 *   get:
 *     tags: [Pins]
 *     summary: Get pin by ID (Public)
 *     parameters:
 *       - in: path
 *         name: pinId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pin details
 *       404:
 *         description: Pin not found
 */
router.get('/:pinId', PinController.getPinById);

/**
 * @swagger
 * /api/pins:
 *   post:
 *     tags: [Pins]
 *     summary: Create new pin (Admin only)
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
 *               - capacity
 *             properties:
 *               brandId:
 *                 type: integer
 *               model:
 *                 type: string
 *               capacity:
 *                 type: number
 *               voltage:
 *                 type: number
 *               cycles:
 *                 type: integer
 *               specifications:
 *                 type: object
 *     responses:
 *       201:
 *         description: Pin created successfully
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticateToken, requireAdmin, validateRequest(pinSchema), PinController.createPin);

/**
 * @swagger
 * /api/pins/{pinId}:
 *   put:
 *     tags: [Pins]
 *     summary: Update pin (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pinId
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
 *               model:
 *                 type: string
 *               capacity:
 *                 type: number
 *               voltage:
 *                 type: number
 *               cycles:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pin updated successfully
 *       403:
 *         description: Admin access required
 */
router.put('/:pinId', authenticateToken, requireAdmin, PinController.updatePin);

/**
 * @swagger
 * /api/pins/{pinId}:
 *   delete:
 *     tags: [Pins]
 *     summary: Delete pin (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pinId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pin deleted successfully
 *       403:
 *         description: Admin access required
 */
router.delete('/:pinId', authenticateToken, requireAdmin, PinController.deletePin);

module.exports = router;

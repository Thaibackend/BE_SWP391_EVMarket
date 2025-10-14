const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// All AI routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/ai/price-suggestion:
 *   post:
 *     tags: [AI]
 *     summary: Get AI price suggestion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemType
 *               - brandId
 *             properties:
 *               itemType:
 *                 type: string
 *                 enum: [Car, Pin]
 *               brandId:
 *                 type: integer
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               condition:
 *                 type: string
 *               mileage:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Price suggestion generated
 *       401:
 *         description: Unauthorized
 */
router.post('/price-suggestion', AIController.getPriceSuggestion);

/**
 * @swagger
 * /api/ai/market-analysis:
 *   get:
 *     tags: [AI]
 *     summary: Get market analysis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Market analysis data
 *       401:
 *         description: Unauthorized
 */
router.get('/market-analysis', AIController.getMarketAnalysis);

module.exports = router;

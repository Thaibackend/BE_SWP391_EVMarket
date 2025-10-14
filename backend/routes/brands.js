const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brandController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, brandSchema } = require('../middleware/validation');

/**
 * @swagger
 * /api/brands:
 *   get:
 *     tags: [Brands]
 *     summary: Get all brands (Public)
 *     responses:
 *       200:
 *         description: List of all brands
 */
router.get('/', BrandController.getAllBrands);

/**
 * @swagger
 * /api/brands/{brandId}:
 *   get:
 *     tags: [Brands]
 *     summary: Get brand by ID (Public)
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand details
 *       404:
 *         description: Brand not found
 */
router.get('/:brandId', BrandController.getBrandById);

/**
 * @swagger
 * /api/brands:
 *   post:
 *     tags: [Brands]
 *     summary: Create new brand (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Car, Pin]
 *               logoUrl:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticateToken, requireAdmin, validateRequest(brandSchema), BrandController.createBrand);

/**
 * @swagger
 * /api/brands/{brandId}:
 *   put:
 *     tags: [Brands]
 *     summary: Update brand (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
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
 *               name:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       403:
 *         description: Admin access required
 */
router.put('/:brandId', authenticateToken, requireAdmin, validateRequest(brandSchema), BrandController.updateBrand);

/**
 * @swagger
 * /api/brands/{brandId}:
 *   delete:
 *     tags: [Brands]
 *     summary: Delete brand (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       403:
 *         description: Admin access required
 */
router.delete('/:brandId', authenticateToken, requireAdmin, BrandController.deleteBrand);

module.exports = router;

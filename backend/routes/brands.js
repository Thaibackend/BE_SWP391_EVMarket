const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brandController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, brandSchema } = require('../middleware/validation');

// Public routes
router.get('/', BrandController.getAllBrands);
router.get('/:brandId', BrandController.getBrandById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, validateRequest(brandSchema), BrandController.createBrand);
router.put('/:brandId', authenticateToken, requireAdmin, validateRequest(brandSchema), BrandController.updateBrand);
router.delete('/:brandId', authenticateToken, requireAdmin, BrandController.deleteBrand);

module.exports = router;

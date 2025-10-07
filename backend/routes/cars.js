const express = require('express');
const router = express.Router();
const CarController = require('../controllers/carController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, carSchema } = require('../middleware/validation');

// Public routes
router.get('/', CarController.getAllCars);
router.get('/search', CarController.searchCars);
router.get('/:carId', CarController.getCarById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, validateRequest(carSchema), CarController.createCar);
router.put('/:carId', authenticateToken, requireAdmin, CarController.updateCar);
router.delete('/:carId', authenticateToken, requireAdmin, CarController.deleteCar);

module.exports = router;

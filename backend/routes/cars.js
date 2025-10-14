const express = require('express');
const router = express.Router();
const CarController = require('../controllers/carController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, carSchema } = require('../middleware/validation');

/**
 * @swagger
 * /api/cars:
 *   get:
 *     tags: [Cars]
 *     summary: Get all cars (Public)
 *     responses:
 *       200:
 *         description: List of all cars
 */
router.get('/', CarController.getAllCars);

/**
 * @swagger
 * /api/cars/search:
 *   get:
 *     tags: [Cars]
 *     summary: Search cars (Public)
 *     parameters:
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered cars
 */
router.get('/search', CarController.searchCars);

/**
 * @swagger
 * /api/cars/{carId}:
 *   get:
 *     tags: [Cars]
 *     summary: Get car by ID (Public)
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Car details
 *       404:
 *         description: Car not found
 */
router.get('/:carId', CarController.getCarById);

/**
 * @swagger
 * /api/cars:
 *   post:
 *     tags: [Cars]
 *     summary: Create new car (Admin only)
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
 *               - year
 *             properties:
 *               brandId:
 *                 type: integer
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               batteryCapacity:
 *                 type: number
 *               range:
 *                 type: number
 *               enginePower:
 *                 type: number
 *               torque:
 *                 type: number
 *               specifications:
 *                 type: object
 *     responses:
 *       201:
 *         description: Car created successfully
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticateToken, requireAdmin, validateRequest(carSchema), CarController.createCar);

/**
 * @swagger
 * /api/cars/{carId}:
 *   put:
 *     tags: [Cars]
 *     summary: Update car (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
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
 *               year:
 *                 type: integer
 *               batteryCapacity:
 *                 type: number
 *               range:
 *                 type: number
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       403:
 *         description: Admin access required
 */
router.put('/:carId', authenticateToken, requireAdmin, CarController.updateCar);

/**
 * @swagger
 * /api/cars/{carId}:
 *   delete:
 *     tags: [Cars]
 *     summary: Delete car (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: carId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       403:
 *         description: Admin access required
 */
router.delete('/:carId', authenticateToken, requireAdmin, CarController.deleteCar);

module.exports = router;

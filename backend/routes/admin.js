const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard', AdminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/overview:
 *   get:
 *     tags: [Admin]
 *     summary: Get system overview (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: System overview
 *       403:
 *         description: Admin access required
 */
router.get('/overview', AdminController.getSystemOverview);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Generate reports (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [overview, users, listings, orders, revenue]
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Report generated
 *       403:
 *         description: Admin access required
 */
router.get('/reports', AdminController.getReports);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: Get system settings (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings
 *       403:
 *         description: Admin access required
 */
router.get('/settings', AdminController.getSystemSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     tags: [Admin]
 *     summary: Update system settings (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commissionRate:
 *                 type: number
 *               maxImagesPerListing:
 *                 type: integer
 *               autoApproveThreshold:
 *                 type: integer
 *               maintenanceMode:
 *                 type: boolean
 *               registrationEnabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Settings updated
 *       403:
 *         description: Admin access required
 */
router.put('/settings', AdminController.updateSystemSettings);

/**
 * @swagger
 * /api/admin/approvals:
 *   get:
 *     tags: [Admin]
 *     summary: Get pending approvals (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending approvals
 *       403:
 *         description: Admin access required
 */
router.get('/approvals', AdminController.getPendingApprovals);

/**
 * @swagger
 * /api/admin/approvals/bulk:
 *   post:
 *     tags: [Admin]
 *     summary: Bulk approve listings (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingIds
 *               - approved
 *             properties:
 *               listingIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               approved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bulk operation completed
 *       403:
 *         description: Admin access required
 */
router.post('/approvals/bulk', AdminController.bulkApproveListings);

module.exports = router;

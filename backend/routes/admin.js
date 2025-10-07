const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard and statistics
router.get('/dashboard', AdminController.getDashboardStats);
router.get('/overview', AdminController.getSystemOverview);
router.get('/reports', AdminController.getReports);

// Settings
router.get('/settings', AdminController.getSystemSettings);
router.put('/settings', AdminController.updateSystemSettings);

// Approvals
router.get('/approvals', AdminController.getPendingApprovals);
router.post('/approvals/bulk', AdminController.bulkApproveListings);

module.exports = router;

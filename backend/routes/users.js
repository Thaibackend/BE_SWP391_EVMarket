const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', requireAdmin, UserController.getAllUsers);
router.get('/stats', requireAdmin, UserController.getUserStats);
router.get('/search', requireAdmin, UserController.searchUsers);
router.get('/:userId', requireAdmin, UserController.getUserById);
router.put('/:userId/status', requireAdmin, UserController.updateUserStatus);
router.put('/:userId/role', requireAdmin, UserController.updateUserRole);

module.exports = router;

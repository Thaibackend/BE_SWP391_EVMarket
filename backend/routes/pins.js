const express = require('express');
const router = express.Router();
const PinController = require('../controllers/pinController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateRequest, pinSchema } = require('../middleware/validation');

// Public routes
router.get('/', PinController.getAllPins);
router.get('/search', PinController.searchPins);
router.get('/:pinId', PinController.getPinById);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, validateRequest(pinSchema), PinController.createPin);
router.put('/:pinId', authenticateToken, requireAdmin, PinController.updatePin);
router.delete('/:pinId', authenticateToken, requireAdmin, PinController.deletePin);

module.exports = router;

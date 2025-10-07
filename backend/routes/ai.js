const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// All AI routes require authentication
router.use(authenticateToken);

// AI-powered features
router.post('/price-suggestion', AIController.getPriceSuggestion);
router.get('/market-analysis', AIController.getMarketAnalysis);

module.exports = router;

const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

router.post("/toggle", favoriteController.toggleFavorite);

module.exports = router;

const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

router.post("/toggle", favoriteController.toggleFavorite);
router.get("/:userId", favoriteController.getFavorites);
module.exports = router;

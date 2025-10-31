const express = require("express");
const { compareListingsController } = require("../controllers/aiController");

const router = express.Router();

router.post("/compare", compareListingsController);

module.exports = router;

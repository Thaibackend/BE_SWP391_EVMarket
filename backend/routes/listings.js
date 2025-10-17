const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listing.controller");

router.post("/", listingController.createListing);

module.exports = router;

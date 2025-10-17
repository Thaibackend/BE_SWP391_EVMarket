const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listing.controller");

router.post("/", listingController.createListing);
router.get("/", listingController.getAllListings);
router.get("/:id", listingController.getListingById);
router.get("/seller/:sellerId", listingController.getListingsBySeller);
router.patch("/:id", listingController.updateListing);
router.patch("/:id/status", listingController.updateStatus);
router.delete("/:id", listingController.deleteListing);
module.exports = router;

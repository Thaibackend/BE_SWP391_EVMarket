const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/", reviewController.createOrUpdateReview);
router.get("/listing/:listingId", reviewController.getReviewsByListing);
router.get("/:userId", reviewController.getReviewsForUser);
router.delete("/:reviewId", reviewController.deleteReview);
module.exports = router;

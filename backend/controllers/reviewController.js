const reviewService = require("../services/reviewService");

exports.createOrUpdateReview = async (req, res) => {
  try {
    const { reviewer, target, rating, comment, listing } = req.body;
    const result = await reviewService.createOrUpdateReview(
      reviewer,
      target,
      rating,
      comment,
      listing
    );

    res.json({
      success: true,
      message: result.updated ? "Review updated" : "Review created",
      review: result.review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await reviewService.getReviewsForUser(userId);
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    await reviewService.deleteReview(reviewId);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReviewsByListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!listingId) return res.status(400).json({ message: "Thiếu listingId" });

    const reviews = await reviewService.getReviewsByListing(listingId);

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    console.error("Error getReviewsByListing:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

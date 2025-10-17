const reviewService = require("../services/reviewService");

exports.createOrUpdateReview = async (req, res) => {
  try {
    const { reviewer, target, rating, comment } = req.body;
    const result = await reviewService.createOrUpdateReview(
      reviewer,
      target,
      rating,
      comment
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

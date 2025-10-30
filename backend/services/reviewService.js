const Review = require("../models/Review");

class ReviewService {
  async createOrUpdateReview(reviewer, target, rating, comment, listing) {
    let review = await Review.findOne({ reviewer, target });

    if (review) {
      review.rating = rating;
      review.comment = comment;

      await review.save();
      return { updated: true, review };
    }

    review = await Review.create({
      reviewer,
      target,
      rating,
      comment,
      listing,
    });
    return { updated: false, review };
  }

  async getReviewsForUser(targetUserId) {
    return Review.find({ target: targetUserId })
      .populate("reviewer", "name avatar") // tuỳ thuộc User có gì
      .sort({ createdAt: -1 });
  }

  async deleteReview(reviewId) {
    return Review.findByIdAndDelete(reviewId);
  }

  async getReviewsByListing(listingId) {
    const reviews = await Review.find({ listing: listingId })
      .populate({
        path: "reviewer",
        select: "name email role avatar",
        match: { role: "seeker" },
      })
      .populate({
        path: "listing",
        select: "title images price",
      })
      .sort({ createdAt: -1 });

    return reviews.filter((r) => r.reviewer !== null);
  }
}

module.exports = new ReviewService();

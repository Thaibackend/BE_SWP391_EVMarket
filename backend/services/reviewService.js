const Review = require("../models/Review");

class ReviewService {
  async createOrUpdateReview(reviewer, target, rating, comment) {
    let review = await Review.findOne({ reviewer, target });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
      return { updated: true, review };
    }

    review = await Review.create({ reviewer, target, rating, comment });
    return { updated: false, review };
  }
}

module.exports = new ReviewService();

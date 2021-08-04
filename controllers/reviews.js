const Boba = require('../models/boba');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const boba = await Boba.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    boba.reviews.push(review);
    await review.save();
    await boba.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/bobas/${boba._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Boba.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/bobas/${id}`);
}
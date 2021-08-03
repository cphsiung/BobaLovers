const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Boba = require('../models/boba');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');

router.post(
    '/',
    isLoggedIn, validateReview, 
    catchAsync(async (req, res) => {
        const boba = await Boba.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id;
        boba.reviews.push(review);
        await review.save();
        await boba.save();
        req.flash('success', 'Successfully created a new review!');
        res.redirect(`/bobas/${boba._id}`);
    })
);

router.delete(
    '/:reviewId', isLoggedIn, isReviewAuthor,
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Boba.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash('success', 'Successfully deleted review!');
        res.redirect(`/bobas/${id}`);
    })
);

module.exports = router;

const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Boba = require('../models/boba');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(', ');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };

router.post(
    '/',
    validateReview,
    catchAsync(async (req, res) => {
      const boba = await Boba.findById(req.params.id);
      const review = new Review(req.body.review);
      boba.reviews.push(review);
      await review.save();
      await boba.save();
      res.redirect(`/bobas/${boba._id}`);
    })
  );
  
  router.delete(
    '/:reviewId',
    catchAsync(async (req, res) => {
      const { id, reviewId } = req.params;
      await Boba.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      res.redirect(`/bobas/${id}`);
    })
  );

  module.exports = router;
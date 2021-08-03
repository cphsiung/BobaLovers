const { bobaSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Boba = require('./models/boba');
const Review = require('./models/review');

// check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //return to URL before login
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

// check if currentUser is the author of the boba place
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const boba = await Boba.findById(id);
    if (!boba.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/bobas/${id}`);
    }
    next();
}

// check if boba place entered is validate
module.exports.validateBoba = (req, res, next) => {
    const { error } = bobaSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// check if a review is validated
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(', ');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };

  module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/bobas/${id}`);
    }
    next();
  }
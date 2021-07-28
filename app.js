const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { bobaSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Boba = require('./models/boba');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/boba-lovers', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateBoba = (req, res, next) => {
  const { error } = bobaSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get('/', (req, res) => {
  res.render('home');
});

app.get(
  '/bobas',
  catchAsync(async (req, res) => {
    const bobas = await Boba.find({});
    res.render('bobas/index', { bobas });
  })
);

app.get('/bobas/new', (req, res) => {
  res.render('bobas/new');
});

app.post(
  '/bobas',
  validateBoba,
  catchAsync(async (req, res, next) => {
    // if (!req.body.boba) throw new ExpressError('Invalid Boba Place Data', 400);

    const boba = new Boba(req.body.boba);
    await boba.save();
    res.redirect(`/bobas/${boba._id}`);
  })
);

app.get(
  '/bobas/:id',
  catchAsync(async (req, res) => {
    const boba = await Boba.findById(req.params.id).populate('reviews');
    res.render('bobas/show', { boba });
  })
);

app.get(
  '/bobas/:id/edit',
  catchAsync(async (req, res) => {
    const boba = await Boba.findById(req.params.id);
    res.render('bobas/edit', { boba });
  })
);

app.put(
  '/bobas/:id/',
  validateBoba,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const boba = await Boba.findByIdAndUpdate(id, { ...req.body.boba });
    res.redirect(`/bobas/${boba._id}`);
  })
);

app.delete(
  '/bobas/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Boba.findByIdAndDelete(id);
    res.redirect('/bobas');
  })
);

app.post(
  '/bobas/:id/reviews',
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

app.delete(
  '/bobas/:id/reviews/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Boba.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/bobas/${id}`);
  })
);

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong!';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Serving on port 3000');
});

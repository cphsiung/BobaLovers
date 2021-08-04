const express = require('express');
const router = express.Router();
const bobas = require('../controllers/bobas');
const catchAsync = require('../utils/catchAsync');
const { validateBoba, isLoggedIn, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(bobas.index))
    .post(isLoggedIn, upload.array('image'), validateBoba, catchAsync(bobas.createBoba));

router.get('/new', isLoggedIn, bobas.renderNewForm);

router.route('/:id')
    .get(catchAsync(bobas.showBoba))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateBoba, catchAsync(bobas.updateBoba))
    .delete(isLoggedIn, isAuthor, catchAsync(bobas.deleteBoba));

router.get(
    '/:id/edit',
    isLoggedIn, isAuthor, catchAsync(bobas.renderEditForm)
);

module.exports = router;

const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { validateBoba, isLoggedIn, isAuthor } = require('../middleware');

const Boba = require('../models/boba');

router.get(
    '/',
    catchAsync(async (req, res) => {
        const bobas = await Boba.find({});
        res.render('bobas/index', { bobas });
    })
);

router.get('/new', isLoggedIn, (req, res) => {
    res.render('bobas/new');
});

router.post(
    '/',
    isLoggedIn, validateBoba,
    catchAsync(async (req, res, next) => {
        const boba = new Boba(req.body.boba);
        boba.author = req.user._id;
        await boba.save();
        req.flash('success', 'Successfully create a new boba place!');
        res.redirect(`/bobas/${boba._id}`);
    })
);

router.get(
    '/:id',
    catchAsync(async (req, res) => {
        const boba = await Boba.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        if (!boba) {
            req.flash('error', 'Boba place not found!');
            return res.redirect('/bobas');
        }
        res.render('bobas/show', { boba });
    })
);

router.get(
    '/:id/edit',
    isLoggedIn, isAuthor, catchAsync(async (req, res) => {
        const {id} = req.params;
        const boba = await Boba.findById(id);
        // check if the boba place exists
        if (!boba) {
            req.flash('error', 'Boba place not found!');
            return res.redirect('/bobas');
        }
        res.render('bobas/edit', { boba });
    })
);

router.put(
    '/:id',
    isLoggedIn, isAuthor, validateBoba,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const boba = await Boba.findByIdAndUpdate(id, { ...req.body.boba });
        req.flash('success', 'Successfully updated the boba place!');
        res.redirect(`/bobas/${boba._id}`);
    })
);

router.delete(
    '/:id', isLoggedIn, isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Boba.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted boba place!');
        res.redirect('/bobas');
    })
);

module.exports = router;

const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { bobaSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Boba = require('../models/boba');

const validateBoba = (req, res, next) => {
    const { error } = bobaSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

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
        // if (!req.body.boba) throw new ExpressError('Invalid Boba Place Data', 400);
        const boba = new Boba(req.body.boba);
        await boba.save();
        req.flash('success', 'Successfully create a new boba place!');
        res.redirect(`/bobas/${boba._id}`);
    })
);

router.get(
    '/:id',
    catchAsync(async (req, res) => {
        const boba = await Boba.findById(req.params.id).populate('reviews');
        if (!boba) {
            req.flash('error', 'Boba place not found!');
            return res.redirect('/bobas');
        }
        res.render('bobas/show', { boba });
    })
);

router.get(
    '/:id/edit',
    isLoggedIn, catchAsync(async (req, res) => {
        const boba = await Boba.findById(req.params.id);
        if (!boba) {
            req.flash('error', 'Boba place not found!');
            return res.redirect('/bobas');
        }
        res.render('bobas/edit', { boba });
    })
);

router.put(
    '/:id',
    isLoggedIn, validateBoba,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const boba = await Boba.findByIdAndUpdate(id, { ...req.body.boba });
        req.flash('success', 'Successfully updated the boba place!');
        res.redirect(`/bobas/${boba._id}`);
    })
);

router.delete(
    '/:id',
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Boba.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted boba place!');
        res.redirect('/bobas');
    })
);

module.exports = router;

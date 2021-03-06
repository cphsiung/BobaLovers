const Boba = require('../models/boba');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const bobas = await Boba.find({});
    res.render('bobas/index', { bobas });
}

module.exports.renderNewForm = (req, res) => {
    res.render('bobas/new');
}

module.exports.createBoba = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.boba.location,
        limit: 1
    }).send()
    const boba = new Boba(req.body.boba);
    boba.geometry = geoData.body.features[0].geometry;
    boba.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    boba.author = req.user._id;
    await boba.save();
    req.flash('success', 'Successfully create a new boba place!');
    res.redirect(`/bobas/${boba._id}`);
}

module.exports.showBoba = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const boba = await Boba.findById(id);
    // check if the boba place exists
    if (!boba) {
        req.flash('error', 'Boba place not found!');
        return res.redirect('/bobas');
    }
    res.render('bobas/edit', { boba });
}

module.exports.updateBoba = async (req, res) => {
    const { id } = req.params;
    const boba = await Boba.findByIdAndUpdate(id, { ...req.body.boba });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    boba.images.push(...imgs);
    await boba.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await boba.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated the boba place!');
    res.redirect(`/bobas/${boba._id}`);
}

module.exports.deleteBoba = async (req, res) => {
    const { id } = req.params;
    await Boba.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted boba place!');
    res.redirect('/bobas');
}
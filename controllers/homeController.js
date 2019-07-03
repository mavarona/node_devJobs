const mongoose = require('mongoose');
const Offer = mongoose.model('Offer');

exports.showJobs = async(req, res, next) => {

    const offers = await Offer.find();

    if (!offers) return next();

    res.render('home', {
        namePage: 'devJobs',
        tagline: 'Encuentra y publica ofertas de trabajo para desarrolladores Web',
        bar: true,
        button: true,
        offers
    })
}
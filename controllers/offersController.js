const mongoose = require('mongoose');
const Offer = mongoose.model('Offer');
const {
    validationResult
} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

exports.formNewOffer = (req, res) => {
    res.render('new-offer', {
        namePage: 'Nueva Oferta',
        tagline: 'Rellena el formulario para publicar una nueva oferta',
        logout: true,
        name: req.user.name,
        img: req.user.img
    });
}

exports.addOffer = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array());
            res.render('new-offer', {
                namePage: 'Nueva Oferta',
                tagline: 'Rellena el formulario para publicar una nueva oferta',
                logout: true,
                name: req.user.name,
                img: req.user.img,
                messages: req.flash()
            });
            return;
        } else {
            const offer = new Offer(req.body);
            offer.author = req.user._id;
            offer.skills = req.body.skills.split(',');
            const newOffer = await offer.save();
            res.redirect(`/offers/${newOffer.url}`);
        }

    } catch (e) {
        let errors = new Array();
        errors.push({
            msg: e
        });
        req.flash('error', errors);
        res.redirect('/offers/new');
    }
}

exports.showOffer = async(req, res, next) => {

    const offer = await Offer.findOne({
        url: req.params.url
    }).populate('author');

    if (!offer) return next();

    res.render('offer', {
        offer,
        namePage: offer.title,
        bar: true
    });

}

exports.formEditOffer = async(req, res, next) => {

    const offer = await Offer.findOne({
        url: req.params.url
    });

    if (!offer) return next();

    res.render('edit-offer', {
        offer,
        namePage: `Editar - ${offer.title}`,
        logout: true,
        name: req.user.name,
        img: req.user.img
    })

}

exports.editOffer = async(req, res) => {
    try {
        const errors = validationResult(req);
        const {
            title
        } = await Offer.findOne({
            url: req.params.url
        });
        if (!errors.isEmpty()) {
            req.flash('error', errors.array());
            res.render('edit-offer', {
                namePage: `Editar - ${title}`,
                logout: true,
                name: req.user.name,
                img: req.user.img,
                messages: req.flash()
            })
            return;
        } else {
            const offerUpdated = req.body;
            offerUpdated.skills = req.body.skills.split(',');
            const offer = await Offer.findOneAndUpdate({
                url: req.params.url
            }, offerUpdated, {
                new: true,
                runValidators: true
            });
            req.flash('correcto', 'La oferta fue editada');
            res.redirect(`/offers/${offer.url}`);
        }

    } catch (e) {
        let errors = new Array();
        errors.push({
            msg: e
        });
        req.flash('error', errors);
        res.redirect(`/offers/edit/${req.params.url}`);
    }

}

exports.deleteOffer = async(req, res) => {
    const {
        id
    } = req.params;

    const offer = await Offer.findById(id);
    if (verifyAuthor(offer, req.user)) {
        offer.remove();
        res.status(200).send('Oferta eliminada correctamente');
    } else {
        res.status(403).send('Error');
    }

}

const verifyAuthor = (offer = {}, user = {}) => {
    if (!offer.author.equals(user._id)) {
        return false;
    }
    return true;
}

exports.uploadCV = (req, res, next) => {
    upload(req, res, function(err) {
        if (err) {
            let errors = new Array();
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    errors.push({
                        msg: 'El tamaño del archivo es muy grande, La imagen no puede superar los 100 kbs'
                    });
                    req.flash('error', errors);
                } else {
                    errors.push({
                        msg: err.message
                    });
                    req.flash('error', errors);
                }
            } else {
                errors.push({
                    msg: err.message
                });
                req.flash('error', errors);
            }
            res.redirect('back');
        } else {
            return next();
        }
    });
}

const configMulter = {
    limits: {
        fileSize: 100000
    },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Formato no valido'), false);
        }
    }
};

const upload = multer(configMulter).single('cv');

exports.contact = async(req, res, next) => {
    const offer = await Offer.findOne({
        url: req.params.url
    });
    if (!offer) return next();
    const newOffer = {
        name: req.body.name,
        email: req.body.email,
        cv: req.file.filename
    };

    offer.candidates.push(newOffer);
    await offer.save();

    req.flash('correcto', 'Se envió correctamente tu curriculum');
    res.redirect('/');
}

exports.showCandidates = async(req, res, next) => {
    const offer = await Offer.findById(req.params.id);
    if (offer.author != req.user._id.toString()) {
        return next();
    }
    if (!offer) return next();
    res.render('candidates', {
        namePage: `Candidatos Oferta - ${offer.title}`,
        logout: true,
        name: req.user.name,
        img: req.user.img,
        candidates: offer.candidates
    })

}

exports.searchOffers = async(req, res) => {
    const offers = await Offer.find({
        $text: {
            $search: req.body.q
        }
    });
    res.render('home', {
        namePage: `Resultados para la búsqueda : ${req.body.q}`,
        bar: true,
        offers
    })
}
const passport = require('passport');
const mongoose = require('mongoose');
const Offer = mongoose.model('Offer');
const Users = mongoose.model('Users');
const crypto = require('crypto');
const sendEmail = require('../handlers/email');

exports.login = passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true,
    badRequestMessage: {
        msg: 'Ambos campos son obligatorios'
    }
});

exports.isAuthenticated = (req, res, next) => {
    // req.isAuthenticated is a method of passport
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

exports.showPanel = async(req, res) => {
    const offers = await Offer.find({
        author: req.user._id
    });
    res.render('admin', {
        namePage: 'Panel de Administración',
        tagline: 'Crea y administra tus ofertas',
        offers,
        logout: true,
        name: req.user.name,
        img: req.user.img,
        bar: true
    });
}

exports.logout = (req, res) => {
    req.logout();
    req.flash('correcto', 'La Sesión se cerró correctamente');
    return res.redirect('/login');
}

exports.formResetPassword = (req, res) => {
    res.render('reset-password', {
        namePage: 'Restablecer la Contraseña',
        tagline: 'Si ya tienes una cuenta y olvidaste tu contraseña, coloca tu E-Mail',
        bar: true
    })
}

exports.sendToken = async(req, res) => {
    const user = await Users.findOne({
        email: req.body.email
    });
    if (!user) {
        let errors = new Array();
        errors.push({
            msg: 'No existe esa cuenta'
        });
        req.flash('error', errors);
        res.redirect('/login');
    }

    user.token = crypto.randomBytes(20).toString('hex');
    user.expireIn = Date.now() + 3600000;

    await user.save();
    const resetUrl = `http://${req.headers.host}/reset-password/${user.token}`;

    await sendEmail.send({
        user,
        subject: 'Restablecer la Contraseña',
        resetUrl,
        template: 'reset'
    })

    req.flash('correcto', 'Revisa tu correo para seguir las indicaciones de como restablecer la contraseña');
    res.redirect('/login');

}

exports.resetPassword = async(req, res) => {
    const {
        token
    } = req.params;
    const user = await Users.findOne({
        token,
        expireIn: {
            $gt: Date.now()
        }
    });

    if (!user) {
        let errors = new Array();
        errors.push({
            msg: 'El enlace ya no es valido, intentelo de nuevo'
        });
        req.flash('error', errors);
        return res.redirect('/reset-password');
    }

    res.render('new-password', {
        namePage: 'Nueva Contraseña'
    });


}

exports.saveNewPassword = async(req, res) => {
    const {
        token
    } = req.params;
    const user = await Users.findOne({
        token,
        expireIn: {
            $gt: Date.now()
        }
    });

    if (!user) {
        let errors = new Array();
        errors.push({
            msg: 'El enlace ya no es valido, intentelo de nuevo'
        });
        req.flash('error', errors);
        return res.redirect('/reset-password');
    }

    user.password = req.body.password;
    user.token = undefined;
    user.expireIn = undefined;

    await user.save();

    req.flash('correcto', 'El password fue modificado');
    res.redirect('/login');

}
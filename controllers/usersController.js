const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const {
    validationResult
} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

exports.formCreateAccount = (req, res) => {
    res.render('create-account', {
        namePage: 'Crea tu cuenta en devjobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    });
}

exports.createAccount = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array());
            res.render('create-account', {
                namePage: 'Crea tu cuenta en devjobs',
                tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
                messages: req.flash()
            });
            return;
        } else {
            const user = new Users(req.body);
            const newUser = await user.save();
            if (!newUser) return next();
            res.redirect('/login');
        }

    } catch (e) {
        let errors = new Array();
        errors.push({
            msg: e
        });
        req.flash('error', errors);
        res.redirect('/create-account');
    }
}

exports.formLogin = (req, res) => {
    res.render('login', {
        namePage: 'Iniciar Sesion devJobs'
    });
}

exports.formEditProfile = (req, res) => {
    res.render('edit-profile', {
        namePage: 'Editar Perfil en devJobs',
        user: req.user,
        logout: true,
        name: req.user.name,
        img: req.user.img
    });
}

exports.editProfile = async(req, res) => {
    try {
        const user = await Users.findById(req.user._id);
        user.name = req.body.name;
        user.email = req.body.email;
        if (req.body.password) {
            user.password = req.body.password
        }

        if (req.file) {
            user.img = req.file.filename
        }
        await user.save();
        req.flash('correcto', 'Cambios guardados correctamente');
        res.redirect('/admin');

    } catch (e) {
        let errors = new Array();
        errors.push({
            msg: e
        });
        req.flash('error', errors);
        res.redirect('/edit-profile');
    }
}

exports.uploadImage = (req, res, next) => {
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
            res.redirect('/admin');
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
            cb(null, __dirname + '../../public/uploads/profiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no valido'), false);
        }
    }
};

const upload = multer(configMulter).single('img');
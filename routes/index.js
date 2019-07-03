const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const offersController = require('../controllers/offersController');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const {
    check
} = require('express-validator');


module.exports = () => {
    router.get('/', homeController.showJobs);

    router.get('/offers/new', authController.isAuthenticated, offersController.formNewOffer);
    router.post('/offers/new', authController.isAuthenticated, [
        check('title').not().isEmpty().trim().escape().withMessage('El título es obligatorio'),
        check('company').not().isEmpty().trim().escape().withMessage('La empresa es obligatoria'),
        check('location').not().isEmpty().trim().escape().withMessage('La ubicacón es obligatoria'),
        check('salary').trim().escape(),
        check('contract').not().isEmpty().trim().escape().withMessage('El contrato es obligatorio'),
        check('skills').not().isEmpty().trim().escape().withMessage('Agrega al menos una habilidad')
    ], offersController.addOffer);

    router.get('/offers/:url', offersController.showOffer);
    router.get('/offers/edit/:url', authController.isAuthenticated, offersController.formEditOffer);
    router.post('/offers/edit/:url', authController.isAuthenticated, [
        check('title').not().isEmpty().trim().escape().withMessage('El título es obligatorio'),
        check('company').not().isEmpty().trim().escape().withMessage('La empresa es obligatoria'),
        check('location').not().isEmpty().trim().escape().withMessage('La ubicacón es obligatoria'),
        check('salary').trim().escape(),
        check('contract').not().isEmpty().trim().escape().withMessage('El contrato es obligatorio'),
        check('skills').not().isEmpty().trim().escape().withMessage('Agrega al menos una habilidad')
    ], offersController.editOffer);

    router.delete('/offers/delete/:id', offersController.deleteOffer);

    // Account
    router.get('/create-account', usersController.formCreateAccount);
    router.post('/create-account', [
        check('name').not().isEmpty().trim().escape().withMessage('El nombre es obligatorio'),
        check('email').isEmail().trim().escape().withMessage('El email debe ser valido'),
        check('password').not().isEmpty().trim().escape().withMessage('El password no puede estar vacio'),
        check('repeatPassword').not().isEmpty().trim().escape().withMessage('El confirmar password no puede estar vacio'),
        check('repeatPassword', 'No coincide con el password').custom((value, {
            req
        }) => (value === req.body.password))
    ], usersController.createAccount);

    // Login
    router.get('/login', usersController.formLogin);
    router.post('/login', authController.login);
    router.get('/reset-password', authController.formResetPassword);
    router.post('/reset-password', authController.sendToken);
    router.get('/reset-password/:token', authController.resetPassword);
    router.post('/reset-password/:token', authController.saveNewPassword);

    // Logout
    router.get('/logout', authController.isAuthenticated, authController.logout);

    // Admin 
    router.get('/admin', authController.isAuthenticated, authController.showPanel);

    // Profile
    router.get('/edit-profile', authController.isAuthenticated, usersController.formEditProfile);
    router.post('/edit-profile', authController.isAuthenticated, usersController.uploadImage, usersController.editProfile);

    router.post('/offers/:url', offersController.uploadCV, offersController.contact);

    router.get('/candidates/:id', authController.isAuthenticated, offersController.showCandidates);

    router.post('/search', offersController.searchOffers);

    return router;
}
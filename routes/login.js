const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/cacthAsync');
const ExpressError = require('../utils/ExpressError');
const passport = require('passport');
const {storeReturnTo} = require('../middleware')

router.get('/', (req,res) => {
    console.log(req.session.originalUrl);
    res.render('register/login');
})

router.post('/', storeReturnTo ,passport.authenticate('local', {failureFlash:true, failureRedirect: '/login'}), (req,res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/campground';
    res.redirect(redirectUrl);
})


module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/cacthAsync');
const ExpressError = require('../utils/ExpressError');


router.get('/', async(req,res) =>{
    res.render('register/userRegister');
    });


    router.post('/', async (req, res, next) => {
        try {
            const { email, username, password } = req.body;
            const user = new User({ username, email });
            const registeredUser = await User.register(user, password);
    
            // Auto inicio de sesión después del registro
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash('success', 'You are now registered and logged in');
                res.redirect('/campground');
            });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Registration failed', error.message);
            res.redirect('/register');
        }
    });

    
module.exports = router;
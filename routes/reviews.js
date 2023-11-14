const express = require('express');
const router = express.Router({mergeParams: true});

const catchAsync = require('../utils/cacthAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require('../models/campground');
const Review = require('../models/reviews');

const reviewControllers = require('../controllers/reviews')



const validateCampground = (error,req, res, next) =>{
    if (error){
        throw new ExpressError(error, 400)
    } else{
        next();
    }
}


router.post('/', catchAsync( reviewControllers.createReview))


router.delete('/:reviewID', catchAsync(reviewControllers.deleteReview))


module.exports = router;
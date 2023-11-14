const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/cacthAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema, reviewSchema} = require('../schemas');
const Review = require('../models/reviews');
const passport = require('passport')
const {isLoggedIn, isAuthor} = require('../middleware');
const campgroundsControllers = require('../controllers/campgrounds')
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage})


const validateCampground = (error,req, res, next) =>{
    if (error){
        throw new ExpressError(error, 400)
    } else{
        next();
    }
}


router.route('/')
    .get( catchAsync(campgroundsControllers.indexCampground))
    .post( isLoggedIn, upload.array('image') , validateCampground ,catchAsync(campgroundsControllers.newCampground))
    
 
 router.get('/new', isLoggedIn,(req, res) => {

     res.render('campgrounds/new');
 })

 router.route('/:id')
    .get( isLoggedIn,catchAsync(campgroundsControllers.showCampground))
    .put(isAuthor, upload.array('image'),catchAsync(campgroundsControllers.updateCampground))
    .delete(isAuthor, catchAsync(campgroundsControllers.deleteCampground))
 
 router.get('/:id/edit', isLoggedIn, isAuthor,catchAsync(campgroundsControllers.editCampground))
 


 
 module.exports = router;
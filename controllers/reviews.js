const Campground = require('../models/campground');
const Review = require('../models/reviews');

const catchAsync = require('../utils/cacthAsync');
const ExpressError = require('../utils/ExpressError');


module.exports.createReview = async(  req, res) => {
    const campgroundID = await Campground.findById(req.params.id);
    const review = new Review(req.body.Review);
    review.author = req.user._id
    campgroundID.reviews.push(review);
    await review.save();
    await campgroundID.save();
    req.flash('success', 'New Review Created');
    res.redirect(`/campground/${campgroundID._id}`)
}

module.exports.deleteReview = async( req,res) =>{
    const {id , reviewID} = req.params; 
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Successfully Review Deleted')
    res.redirect(`/campground/${id}`)

}
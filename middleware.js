const {campgroundSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground  = require('./models/campground');


module.exports.isLoggedIn = (req, res, next) =>{
    if( !req.isAuthenticated()){
        req.session.originalUrl= req.originalUrl;
        req.flash('success','YOU MUST LOG IN FIRST')
        return res.redirect('/login')
    }
    next()
}

module.exports.storeReturnTo = (req, res, next ) =>{
    if (req.session.originalUrl){
        res.locals.returnTo = req.session.originalUrl;
        delete req.session.originalUrl;
    }
    next()
}

module.exports.isAuthor = async (req,res,next) => {
const { id } = req.params;
const campground = await Campground.findById(id);
if (!campground.author.equals(req.user._id)) {

   req.flash('error', 'You are not the author of this Campground')
   return res.redirect(`/campground/${id}`)
}else{
    next()}
}
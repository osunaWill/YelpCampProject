const Campground = require('../models/campground')
const multer = require('multer');
const { cloudinary, storage } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding ({accessToken:  mapBoxToken})

module.exports.indexCampground = async (req, res)=>{
    const campground = await Campground.find({});
    const campgroundID = await Campground.findById(req.params.id);
    res.render('campgrounds/index', {campground, campgroundID}) 
 }


 module.exports.newCampground = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(f => ({url: f.path , filename: f.filename}))
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp)
    req.flash('success', 'Campamento posted TODO BIEN!');
    res.redirect(`/campground/${newCamp._id}`)
    }

 module.exports.showCampground = async (req,res)=> {
    const campgroundID = await Campground.findById(req.params.id).populate({path:'reviews', populate:{
       path:'author'}
   }).populate('author');
    console.log(campgroundID)
    if(!campgroundID) {
       req.flash('error', "Can't find that campground");
       res.redirect('/campground');
    }
    res.render('campgrounds/show', {campgroundID})
}

 module.exports.editCampground = async (req, res) => {
    const campgroundID = await Campground.findById(req.params.id)
    if(!campgroundID) {
       req.flash('error', "Can't find that campground");
       res.redirect('/campground');
    }
    res.render('campgrounds/edit', {campgroundID})
}

module.exports.updateCampground = async (req, res) => {
   const { id } = req.params;
   console.log(req.body);

   const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});

   // Eliminar imágenes de Cloudinary
   if (req.body.deleteImages) {
       for (const filename of req.body.deleteImages) {
           await cloudinary.uploader.destroy(filename);
           campground.images = campground.images.filter(img => img.filename !== filename);
       }
   }

   // Agregar nuevas imágenes si las hay
   if (req.files) {
       const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
       campground.images.push(...imgs);
   }

   await campground.save();

   req.flash('success', 'Campground UPDATE!');
   res.redirect(`/campground/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted Successfully')
    res.redirect('/campground');
}
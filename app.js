if ([process.env.NODE_ENV !== "production"]){
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const overrider = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoDBStore = require('connect-mongo')(session);

const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas');
const Review = require('./models/reviews');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user')
const {isLoggedIn} = require('./middleware');
const {storeReturnTo} = require('./middleware')

const campground = require('./routes/campground');
const reviews = require('./routes/reviews');
const register = require('./routes/register');
const login = require('./routes/login')
const { serialize } = require('v8');
const helmet = require('helmet');

const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

// mongodb://127.0.0.1:27017/yelp-camp
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

const app = express();


app.engine('ejs' , ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const secret = process.env.SECRET || "gus2525";

const store = new MongoDBStore({
    url:dbURL,
    secret,
    touchAfter: 24*60*60
});

store.on('error', function(e){
    console.log('SESSION STORE ERROR', e)
})



const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        htttp: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

app.use(express.urlencoded({extended: true}));
app.use(overrider('_method'));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const validateCampground = (error,req, res, next) =>{
    if (error){
        throw new ExpressError(error, 400)
    } else{
        next();
    }
}

app.use((req,res,next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campground', storeReturnTo, campground);
app.use('/campground/:id/reviews', isLoggedIn, storeReturnTo, reviews);
app.use('/register', register);
app.use('/login', login);

app.get('/home', (req, res) =>{
    res.render('home')
})

app.get('/logout', (req,res) => {
    req.logout(function(err){
        if (err){
            return next(err);
        }
        req.flash('success', 'You are logged out, see you later.');
        res.redirect('/campground');
    });
})

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something is wrong' } = err;
    res.status(statusCode).render('campgrounds/error', { err });
});


app.listen(3000, () => {
    console.log('ACTIVOO')
})
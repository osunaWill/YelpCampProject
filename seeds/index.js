const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../models/campground');
const {places, descriptors} = require('./seedHelpers');


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

const sample = array => array[Math.floor(Math.random()* array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for (let i=0; i<50; i++){
    const randomNum1k = Math.floor(Math.random()* 1000)
    const randomPlace = sample(places);
    const randomDescriptors = sample(descriptors);

    const camp = new Campground ({
        location: `${cities[randomNum1k].city}, ${cities[randomNum1k].state} `,
        title: `${randomDescriptors} ${randomPlace}`,
        image: 'https://images.unsplash.com/photo-1531082822380-ee7e09be4bf4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2128&q=80',
        description: 'XDDD2',
        price: randomNum1k
    })
     await camp.save()
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})
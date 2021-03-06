const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Boba = require('../models/boba');

mongoose.connect('mongodb://localhost:27017/boba-lovers', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Boba.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 10) + 3;
        const boba = new Boba({
            author: '6107923364439945347de4df',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dx1fbfw74/image/upload/v1628051987/BobaLovers/xmo6g3rpkeldct2yz2i1.jpg',
                    filename: 'BobaLovers/xmo6g3rpkeldct2yz2i1'
                },
                {
                    url: 'https://res.cloudinary.com/dx1fbfw74/image/upload/v1628051992/BobaLovers/cdpysyi22txwhlnt4ogg.jpg',
                    filename: 'BobaLovers/cdpysyi22txwhlnt4ogg'
                }
            ]
        });
        await boba.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});

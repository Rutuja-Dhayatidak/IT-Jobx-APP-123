const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Candidate = require('./src/models/Candidate');
    const Profile = require('./src/models/Profile');
    const profile = await Profile.findOne({ userId: '6a5217c0bdda0b8aea389be3' }).populate('userId');
    console.log('Profile model details:', profile);
    process.exit(0);
}).catch(console.error);

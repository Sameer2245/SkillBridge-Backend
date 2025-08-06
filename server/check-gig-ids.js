const mongoose = require('mongoose');
const Gig = require('./models/Gig');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const gigs = await Gig.find({}).select('_id title');
  console.log('Available gigs:');
  gigs.forEach((gig, i) => {
    console.log(`${i+1}. ID: ${gig._id} - Title: ${gig.title}`);
  });
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

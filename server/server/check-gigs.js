const mongoose = require('mongoose');
const Gig = require('./models/Gig');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const gigs = await Gig.find({}).populate('userId', 'username');
  console.log('Total gigs:', gigs.length);
  gigs.forEach((gig, i) => {
    console.log(`${i+1}. ${gig.title} (ID: ${gig._id}) - Seller: ${gig.userId?.username || 'Unknown'}`);
    console.log(`   Active: ${gig.isActive}, Paused: ${gig.isPaused}`);
  });
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

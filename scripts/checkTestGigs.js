const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
const Gig = require('../models/Gig');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkTestGigs = async () => {
  try {
    console.log('🔍 Checking test gigs...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test seller
    const seller = await User.findOne({ email: 'seller@test.com' });
    if (!seller) {
      console.log('❌ Test seller not found. Please run the seeding script first.');
      process.exit(1);
    }

    console.log('✅ Found test seller:', seller.username);

    // Find gigs by the test seller
    const gigs = await Gig.find({ userId: seller._id }).populate('userId', 'username email');
    
    if (gigs.length === 0) {
      console.log('❌ No gigs found for test seller. Please run the seeding script.');
      process.exit(1);
    }

    console.log(`\n📋 Found ${gigs.length} test gigs:`);
    gigs.forEach((gig, index) => {
      console.log(`\n${index + 1}. ${gig.title}`);
      console.log(`   ID: ${gig._id}`);
      console.log(`   Seller: ${gig.userId.username}`);
      console.log(`   Category: ${gig.category}`);
      console.log(`   Price: $${gig.price}`);
      console.log(`   Status: ${gig.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   URL: http://localhost:3000/gigs/${gig._id}`);
    });

    console.log('\n🎯 To test the payment flow:');
    console.log('1. Visit: http://localhost:3000');
    console.log('2. Login as: buyer@test.com / password123');
    console.log('3. Go to: http://localhost:3000/gigs');
    console.log('4. Look for gigs by "sarah_dev"');
    console.log('5. Click on any gig and then "Continue to Payment"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking test gigs:', error);
    process.exit(1);
  }
};

checkTestGigs();
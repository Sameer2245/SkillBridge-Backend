const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freelance-marketplace');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkData = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGigs = await Gig.countDocuments();
    
    console.log(`📊 Database Statistics:`);
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`💼 Total Gigs: ${totalGigs}`);
    console.log('');
    
    // Get category breakdown
    const categoryStats = await Gig.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('📈 Gigs by Category:');
    categoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} gigs (avg price: $${Math.round(stat.avgPrice)})`);
    });
    console.log('');
    
    // Get subcategory breakdown for Programming & Tech
    const programmingSubcats = await Gig.aggregate([
      {
        $match: { category: 'Programming & Tech' }
      },
      {
        $group: {
          _id: '$subcategory',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('💻 Programming & Tech Subcategories:');
    programmingSubcats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} gigs`);
    });
    console.log('');
    
    // Sample some gig titles
    const sampleGigs = await Gig.find({}).limit(10).select('title category price');
    console.log('📝 Sample Gigs:');
    sampleGigs.forEach(gig => {
      console.log(`   "${gig.title}" - ${gig.category} - $${gig.price}`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  checkData();
});
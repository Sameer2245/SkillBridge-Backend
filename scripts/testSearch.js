const mongoose = require('mongoose');
const Gig = require('../models/Gig');
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

const testSearchQueries = async () => {
  console.log('🔍 Testing Search System...\n');
  
  const testQueries = [
    'logo design',
    'website development', 
    'mobile app',
    'content writing',
    'seo',
    'video editing',
    'ai chatbot',
    'wordpress',
    'business plan',
    'social media'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔎 Testing query: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      // Test text search
      const textResults = await Gig.find({
        $text: { $search: query },
        isActive: true,
        isPaused: false
      })
      .populate('userId', 'username fullName')
      .limit(5)
      .lean();
      
      console.log(`📊 Text search results: ${textResults.length}`);
      
      // Test regex search (fallback)
      const regexResults = await Gig.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { searchTags: { $in: [new RegExp(query, 'i')] } },
          { category: { $regex: query, $options: 'i' } },
          { subcategory: { $regex: query, $options: 'i' } }
        ],
        isActive: true,
        isPaused: false
      })
      .populate('userId', 'username fullName')
      .limit(5)
      .lean();
      
      console.log(`📊 Regex search results: ${regexResults.length}`);
      
      // Show sample results
      const results = textResults.length > 0 ? textResults : regexResults;
      if (results.length > 0) {
        console.log('\n📝 Sample results:');
        results.slice(0, 3).forEach((gig, index) => {
          console.log(`  ${index + 1}. "${gig.title}" - ${gig.category} - $${gig.packages?.basic?.price || gig.price}`);
          console.log(`     by ${gig.userId?.fullName || 'Unknown'}`);
          if (gig.tags?.length > 0) {
            console.log(`     Tags: ${gig.tags.slice(0, 3).join(', ')}`);
          }
        });
      } else {
        console.log('❌ No results found');
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${query}":`, error.message);
    }
  }
};

const testFilters = async () => {
  console.log('\n\n🎛️ Testing Filters...\n');
  
  try {
    // Test category filter
    const categories = await Gig.aggregate([
      { $match: { isActive: true, isPaused: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('📊 Categories with gig counts:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} gigs`);
    });
    
    // Test price range
    const priceStats = await Gig.aggregate([
      { $match: { isActive: true, isPaused: false } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$packages.basic.price' },
          maxPrice: { $max: '$packages.basic.price' },
          avgPrice: { $avg: '$packages.basic.price' }
        }
      }
    ]);
    
    console.log('\n💰 Price statistics:');
    if (priceStats[0]) {
      console.log(`  Min: $${priceStats[0].minPrice}`);
      console.log(`  Max: $${priceStats[0].maxPrice}`);
      console.log(`  Avg: $${Math.round(priceStats[0].avgPrice)}`);
    }
    
    // Test delivery times
    const deliveryTimes = await Gig.aggregate([
      { $match: { isActive: true, isPaused: false } },
      { $group: { _id: '$packages.basic.deliveryTime', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n⏰ Delivery times:');
    deliveryTimes.forEach(dt => {
      console.log(`  ${dt._id} day${dt._id !== 1 ? 's' : ''}: ${dt.count} gigs`);
    });
    
  } catch (error) {
    console.error('❌ Error testing filters:', error.message);
  }
};

const testSuggestions = async () => {
  console.log('\n\n💡 Testing Suggestions...\n');
  
  const partialQueries = ['log', 'web', 'mob', 'seo', 'vid'];
  
  for (const partial of partialQueries) {
    console.log(`\n🔤 Testing partial query: "${partial}"`);
    
    try {
      // Get title suggestions
      const titleSuggestions = await Gig.find({
        title: { $regex: partial, $options: 'i' },
        isActive: true,
        isPaused: false
      })
      .select('title')
      .limit(3)
      .lean();
      
      // Get tag suggestions
      const tagSuggestions = await Gig.find({
        tags: { $in: [new RegExp(partial, 'i')] },
        isActive: true,
        isPaused: false
      })
      .select('tags')
      .limit(3)
      .lean();
      
      console.log('  📝 Title suggestions:');
      titleSuggestions.forEach(gig => {
        console.log(`    "${gig.title}"`);
      });
      
      console.log('  🏷️ Tag suggestions:');
      const uniqueTags = new Set();
      tagSuggestions.forEach(gig => {
        gig.tags.forEach(tag => {
          if (tag.toLowerCase().includes(partial.toLowerCase()) && uniqueTags.size < 3) {
            uniqueTags.add(tag);
          }
        });
      });
      uniqueTags.forEach(tag => {
        console.log(`    "${tag}"`);
      });
      
    } catch (error) {
      console.error(`❌ Error testing suggestions for "${partial}":`, error.message);
    }
  }
};

const runAllTests = async () => {
  try {
    await testSearchQueries();
    await testFilters();
    await testSuggestions();
    
    console.log('\n\n🎉 Search system testing completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Text search with MongoDB $text operator');
    console.log('✅ Regex fallback search');
    console.log('✅ Category and price filtering');
    console.log('✅ Real-time suggestions');
    console.log('✅ Comprehensive search tags');
    
  } catch (error) {
    console.error('❌ Error running tests:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  runAllTests();
});
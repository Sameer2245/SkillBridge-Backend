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

const enhanceSearchData = async () => {
  try {
    console.log('🔍 Enhancing search data for all gigs...');

    // Get all gigs
    const gigs = await Gig.find({});
    console.log(`Found ${gigs.length} gigs to enhance`);

    let updated = 0;

    for (const gig of gigs) {
      let needsUpdate = false;
      const updates = {};

      // Generate search tags if missing or empty
      if (!gig.searchTags || gig.searchTags.length === 0) {
        const searchTags = generateSearchTags(gig);
        updates.searchTags = searchTags;
        needsUpdate = true;
      }

      // Ensure tags exist
      if (!gig.tags || gig.tags.length === 0) {
        const tags = generateTags(gig);
        updates.tags = tags;
        needsUpdate = true;
      }

      // Add some stats if missing
      if (gig.totalRating === 0) {
        updates.totalRating = Math.random() * (5.0 - 4.0) + 4.0;
        updates.totalReviews = Math.floor(Math.random() * 50) + 1;
        updates.totalOrders = Math.floor(Math.random() * 100) + 1;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Gig.findByIdAndUpdate(gig._id, updates);
        updated++;
      }
    }

    console.log(`✅ Enhanced ${updated} gigs with better search data`);

    // Test search functionality
    console.log('\n🧪 Testing search functionality...');
    
    const testQueries = ['website', 'logo', 'design', 'programming', 'writing', 'marketing'];
    
    for (const query of testQueries) {
      const results = await Gig.find({
        $text: { $search: query },
        isActive: true,
        isPaused: false
      }).limit(3);
      
      console.log(`"${query}": ${results.length} results`);
    }

    console.log('\n✨ Search enhancement completed!');

  } catch (error) {
    console.error('Error enhancing search data:', error);
  } finally {
    mongoose.connection.close();
  }
};

const generateSearchTags = (gig) => {
  const tags = [];
  
  // Add category-based tags
  const categoryTags = {
    'Programming & Tech': ['coding', 'development', 'programming', 'tech', 'software', 'web', 'app', 'website', 'api', 'database'],
    'Graphics & Design': ['design', 'graphic', 'visual', 'creative', 'logo', 'branding', 'illustration', 'photoshop', 'adobe', 'art'],
    'Writing & Translation': ['writing', 'content', 'copywriting', 'blog', 'article', 'translation', 'proofreading', 'editing', 'seo content'],
    'Digital Marketing': ['marketing', 'seo', 'social media', 'advertising', 'promotion', 'traffic', 'leads', 'conversion', 'analytics'],
    'Video & Animation': ['video', 'animation', 'editing', 'motion graphics', 'explainer', 'promotional', 'youtube', 'after effects'],
    'Music & Audio': ['music', 'audio', 'sound', 'voice', 'recording', 'mixing', 'mastering', 'podcast', 'jingle'],
    'Business': ['business', 'consulting', 'strategy', 'plan', 'analysis', 'market research', 'presentation', 'excel'],
    'Lifestyle': ['lifestyle', 'personal', 'coaching', 'fitness', 'health', 'wellness', 'advice', 'guidance'],
    'Data': ['data', 'analysis', 'excel', 'visualization', 'research', 'statistics', 'reporting', 'dashboard'],
    'Photography': ['photography', 'photo', 'editing', 'retouching', 'portrait', 'product', 'commercial', 'lightroom']
  };

  if (categoryTags[gig.category]) {
    tags.push(...categoryTags[gig.category]);
  }

  // Add subcategory-based tags
  const subcategoryTags = {
    'Website Development': ['website', 'web development', 'responsive', 'html', 'css', 'javascript', 'react', 'vue', 'angular'],
    'WordPress': ['wordpress', 'wp', 'cms', 'theme', 'plugin', 'customization', 'woocommerce'],
    'Mobile Apps': ['mobile app', 'ios', 'android', 'react native', 'flutter', 'app development'],
    'AI Services': ['ai', 'artificial intelligence', 'machine learning', 'chatbot', 'automation', 'nlp'],
    'Blockchain': ['blockchain', 'cryptocurrency', 'smart contracts', 'web3', 'defi', 'nft'],
    'Logo Design': ['logo', 'brand identity', 'branding', 'corporate identity', 'brand design'],
    'Social Media Marketing': ['social media', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'social media management']
  };

  if (subcategoryTags[gig.subcategory]) {
    tags.push(...subcategoryTags[gig.subcategory]);
  }

  // Extract keywords from title and description
  const titleWords = gig.title.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const descWords = gig.description.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  
  tags.push(...titleWords.slice(0, 5));
  tags.push(...descWords.slice(0, 10));

  // Remove duplicates and return
  return [...new Set(tags)].slice(0, 20);
};

const generateTags = (gig) => {
  const tags = [];
  
  // Add main category tag
  tags.push(gig.category.toLowerCase());
  
  // Add subcategory tag
  if (gig.subcategory) {
    tags.push(gig.subcategory.toLowerCase());
  }

  // Add price range tags
  const price = gig.packages?.basic?.price || gig.price || 0;
  if (price < 50) tags.push('budget-friendly', 'affordable');
  else if (price < 200) tags.push('mid-range', 'professional');
  else tags.push('premium', 'high-end');

  // Add delivery time tags
  const deliveryTime = gig.packages?.basic?.deliveryTime || gig.deliveryTime || 7;
  if (deliveryTime <= 1) tags.push('express', '24h');
  else if (deliveryTime <= 3) tags.push('fast delivery');
  else if (deliveryTime <= 7) tags.push('standard delivery');

  return tags.slice(0, 10);
};

connectDB().then(() => {
  enhanceSearchData();
});
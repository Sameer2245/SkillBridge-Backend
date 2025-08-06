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

const enhanceGigsForSearch = async () => {
  try {
    console.log('🔍 Enhancing gigs with search tags and keywords...');
    
    // Get all gigs
    const gigs = await Gig.find({});
    console.log(`Found ${gigs.length} gigs to enhance`);
    
    let updatedCount = 0;
    
    for (const gig of gigs) {
      const searchTags = [];
      const tags = [];
      
      // Generate search tags based on category and title
      switch (gig.category) {
        case 'Programming & Tech':
          if (gig.title.toLowerCase().includes('website') || gig.title.toLowerCase().includes('web')) {
            searchTags.push('website development', 'web design', 'responsive design', 'html', 'css', 'javascript');
            tags.push('website', 'web development', 'responsive', 'frontend');
          }
          if (gig.title.toLowerCase().includes('wordpress')) {
            searchTags.push('wordpress development', 'cms', 'blog', 'ecommerce');
            tags.push('wordpress', 'cms', 'blog');
          }
          if (gig.title.toLowerCase().includes('mobile') || gig.title.toLowerCase().includes('app')) {
            searchTags.push('mobile app', 'ios', 'android', 'react native', 'flutter');
            tags.push('mobile', 'app development', 'ios', 'android');
          }
          if (gig.title.toLowerCase().includes('ai') || gig.title.toLowerCase().includes('chatbot')) {
            searchTags.push('artificial intelligence', 'machine learning', 'chatbot', 'automation');
            tags.push('ai', 'chatbot', 'automation');
          }
          if (gig.title.toLowerCase().includes('blockchain')) {
            searchTags.push('cryptocurrency', 'smart contracts', 'web3', 'defi');
            tags.push('blockchain', 'crypto', 'web3');
          }
          // Default programming tags
          searchTags.push('coding', 'programming', 'software development', 'tech');
          tags.push('programming', 'coding', 'software');
          break;
          
        case 'Graphics & Design':
          if (gig.title.toLowerCase().includes('logo')) {
            searchTags.push('logo design', 'brand identity', 'branding', 'business logo');
            tags.push('logo', 'branding', 'identity');
          }
          if (gig.title.toLowerCase().includes('business card')) {
            searchTags.push('business cards', 'stationery', 'print design');
            tags.push('business card', 'print design');
          }
          if (gig.title.toLowerCase().includes('ui') || gig.title.toLowerCase().includes('ux')) {
            searchTags.push('user interface', 'user experience', 'app design', 'web design');
            tags.push('ui design', 'ux design', 'interface');
          }
          // Default design tags
          searchTags.push('graphic design', 'creative design', 'visual design');
          tags.push('design', 'graphics', 'creative');
          break;
          
        case 'Writing & Translation':
          if (gig.title.toLowerCase().includes('blog') || gig.title.toLowerCase().includes('article')) {
            searchTags.push('blog writing', 'article writing', 'content creation', 'seo writing');
            tags.push('blog', 'article', 'content');
          }
          if (gig.title.toLowerCase().includes('copy') || gig.title.toLowerCase().includes('sales')) {
            searchTags.push('copywriting', 'sales copy', 'marketing copy', 'persuasive writing');
            tags.push('copywriting', 'sales copy');
          }
          if (gig.title.toLowerCase().includes('translation')) {
            searchTags.push('language translation', 'multilingual', 'localization');
            tags.push('translation', 'language');
          }
          // Default writing tags
          searchTags.push('content writing', 'writing services', 'professional writing');
          tags.push('writing', 'content', 'text');
          break;
          
        case 'Digital Marketing':
          if (gig.title.toLowerCase().includes('seo')) {
            searchTags.push('search engine optimization', 'google ranking', 'keyword research');
            tags.push('seo', 'search optimization');
          }
          if (gig.title.toLowerCase().includes('social media')) {
            searchTags.push('social media marketing', 'facebook', 'instagram', 'twitter', 'linkedin');
            tags.push('social media', 'marketing');
          }
          if (gig.title.toLowerCase().includes('ads') || gig.title.toLowerCase().includes('ppc')) {
            searchTags.push('google ads', 'facebook ads', 'ppc', 'advertising');
            tags.push('ads', 'ppc', 'advertising');
          }
          // Default marketing tags
          searchTags.push('digital marketing', 'online marketing', 'marketing strategy');
          tags.push('marketing', 'digital', 'promotion');
          break;
          
        case 'Video & Animation':
          if (gig.title.toLowerCase().includes('video editing')) {
            searchTags.push('video editing', 'post production', 'video production');
            tags.push('video editing', 'editing');
          }
          if (gig.title.toLowerCase().includes('animation')) {
            searchTags.push('2d animation', '3d animation', 'motion graphics');
            tags.push('animation', 'motion graphics');
          }
          // Default video tags
          searchTags.push('video services', 'multimedia', 'visual content');
          tags.push('video', 'animation', 'multimedia');
          break;
          
        case 'Music & Audio':
          searchTags.push('audio editing', 'music production', 'sound design', 'voiceover');
          tags.push('audio', 'music', 'sound');
          break;
          
        case 'Business':
          if (gig.title.toLowerCase().includes('business plan')) {
            searchTags.push('business planning', 'startup', 'entrepreneur', 'business strategy');
            tags.push('business plan', 'strategy');
          }
          if (gig.title.toLowerCase().includes('market research')) {
            searchTags.push('market analysis', 'competitor research', 'business research');
            tags.push('market research', 'analysis');
          }
          // Default business tags
          searchTags.push('business services', 'consulting', 'professional services');
          tags.push('business', 'consulting', 'professional');
          break;
          
        case 'Data':
          searchTags.push('data analysis', 'data visualization', 'excel', 'statistics', 'reporting');
          tags.push('data', 'analysis', 'visualization');
          break;
          
        case 'Photography':
          searchTags.push('photo editing', 'photography', 'image editing', 'retouching');
          tags.push('photography', 'photo editing', 'images');
          break;
          
        case 'Lifestyle':
          searchTags.push('lifestyle services', 'personal services', 'coaching');
          tags.push('lifestyle', 'personal', 'coaching');
          break;
      }
      
      // Add common search terms
      searchTags.push('freelancer', 'professional', 'expert', 'service');
      
      // Update the gig with new tags
      await Gig.findByIdAndUpdate(gig._id, {
        $set: {
          tags: [...new Set([...(gig.tags || []), ...tags])],
          searchTags: [...new Set([...(gig.searchTags || []), ...searchTags])]
        }
      });
      
      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`✅ Enhanced ${updatedCount}/${gigs.length} gigs`);
      }
    }
    
    console.log(`🎉 Successfully enhanced ${updatedCount} gigs with search tags!`);
    
    // Create text indexes
    console.log('📝 Creating text indexes...');
    try {
      await Gig.collection.createIndex({
        title: "text",
        description: "text", 
        tags: "text", 
        searchTags: "text",
        category: "text",
        subcategory: "text"
      }, {
        weights: {
          title: 10,
          tags: 8,
          searchTags: 8,
          category: 6,
          subcategory: 6,
          description: 4
        },
        name: "gig_search_index"
      });
      console.log('✅ Text indexes created successfully');
    } catch (error) {
      console.log('ℹ️ Text indexes already exist or error:', error.message);
    }
    
  } catch (error) {
    console.error('Error enhancing gigs:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  enhanceGigsForSearch();
});
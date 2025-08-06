const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Gig = require('../models/Gig');

dotenv.config();

const createIndexes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Listing current indexes...');
    const currentIndexes = await Gig.collection.listIndexes().toArray();
    console.log('📋 Current indexes:');
    currentIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop all text indexes
    console.log('🗑️ Dropping all text indexes...');
    for (const index of currentIndexes) {
      if (index.name !== '_id_' && (index.name.includes('text') || Object.values(index.key).includes('text'))) {
        try {
          await Gig.collection.dropIndex(index.name);
          console.log(`🗑️ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`⚠️ Could not drop index ${index.name}:`, error.message);
        }
      }
    }

    console.log('🔍 Creating new text search index...');
    
    // Create the text index manually
    await Gig.collection.createIndex(
      { 
        title: "text", 
        description: "text", 
        tags: "text", 
        searchTags: "text",
        category: "text",
        subcategory: "text"
      },
      {
        weights: {
          title: 10,
          tags: 8,
          searchTags: 8,
          category: 6,
          subcategory: 6,
          description: 4
        },
        name: "gig_text_index"
      }
    );

    console.log('✅ Text search index created successfully');

    // Create other important indexes manually
    console.log('🔍 Creating other indexes...');
    
    const indexesToCreate = [
      { key: { category: 1, subcategory: 1 }, name: 'category_subcategory' },
      { key: { "packages.basic.price": 1 }, name: 'basic_price' },
      { key: { "packages.basic.deliveryTime": 1 }, name: 'basic_delivery' },
      { key: { totalRating: -1, totalReviews: -1 }, name: 'rating_reviews' },
      { key: { totalOrders: -1 }, name: 'total_orders' },
      { key: { createdAt: -1 }, name: 'created_at' },
      { key: { isActive: 1, isPaused: 1 }, name: 'active_paused' },
      { key: { category: 1, "packages.basic.price": 1 }, name: 'category_price' },
      { key: { totalRating: -1, "packages.basic.price": 1 }, name: 'rating_price' },
      { key: { isActive: 1, isPaused: 1, totalRating: -1 }, name: 'active_rating' }
    ];

    for (const indexDef of indexesToCreate) {
      try {
        await Gig.collection.createIndex(indexDef.key, { name: indexDef.name });
        console.log(`✅ Created index: ${indexDef.name}`);
      } catch (error) {
        if (error.code === 85) { // IndexOptionsConflict
          console.log(`ℹ️ Index ${indexDef.name} already exists with different options`);
        } else {
          console.log(`⚠️ Could not create index ${indexDef.name}:`, error.message);
        }
      }
    }

    // List all indexes again
    const finalIndexes = await Gig.collection.listIndexes().toArray();
    console.log('📋 Final indexes:');
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('🎉 Index creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

createIndexes();
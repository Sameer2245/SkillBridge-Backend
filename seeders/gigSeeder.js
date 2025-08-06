const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Gig = require('../models/Gig');
const User = require('../models/User');

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data arrays
const categories = [
  'Graphics & Design',
  'Digital Marketing', 
  'Writing & Translation',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech',
  'Business',
  'Lifestyle',
  'Data',
  'Photography'
];

const subcategories = {
  'Graphics & Design': [
    'Logo Design', 'Brand Style Guides', 'Business Cards & Stationery', 
    'Web & Mobile Design', 'Packaging & Label Design', 'Illustration',
    'Print Design', 'Presentation Design', 'Social Media Design'
  ],
  'Digital Marketing': [
    'SEO', 'Social Media Marketing', 'Content Marketing', 'Email Marketing',
    'Search Engine Marketing', 'Video Marketing', 'Influencer Marketing',
    'Marketing Strategy', 'Local SEO', 'E-Commerce Marketing'
  ],
  'Writing & Translation': [
    'Articles & Blog Posts', 'Translation', 'Proofreading & Editing',
    'Technical Writing', 'Creative Writing', 'Website Content',
    'Product Descriptions', 'UX Writing', 'Scriptwriting'
  ],
  'Video & Animation': [
    'Video Editing', 'Animation', 'Whiteboard Animation', 'Video Production',
    'Motion Graphics', '3D Animation', 'Explainer Videos', 'Video Templates',
    'Subtitles & Captions', 'Character Animation'
  ],
  'Music & Audio': [
    'Music Production', 'Audio Editing', 'Voice Over', 'Mixing & Mastering',
    'Songwriting', 'Jingles & Intros', 'Podcast Production', 'Sound Design',
    'Audio Ads Production', 'Meditation Music'
  ],
  'Programming & Tech': [
    'Website Development', 'Mobile Apps', 'Desktop Applications', 
    'WordPress', 'E-Commerce Development', 'Database', 'User Testing',
    'QA & Testing', 'Support & IT', 'Game Development'
  ],
  'Business': [
    'Business Plans', 'Market Research', 'Presentations', 'Legal Consulting',
    'Business Consulting', 'Financial Consulting', 'HR Consulting',
    'Sales', 'Lead Generation', 'Customer Care'
  ],
  'Lifestyle': [
    'Gaming', 'Recreation & Hobbies', 'Self Improvement', 'Fitness',
    'Nutrition', 'Arts & Crafts', 'Relationship', 'Wellness',
    'Astrology & Psychics', 'Online Tutoring'
  ],
  'Data': [
    'Data Entry', 'Data Processing', 'Data Analytics', 'Data Visualization',
    'Databases', 'Data Mining', 'Business Intelligence', 'Data Science',
    'Machine Learning', 'Statistical Analysis'
  ],
  'Photography': [
    'Portrait Photography', 'Product Photography', 'Event Photography',
    'Real Estate Photography', 'Photo Editing', 'Stock Photography',
    'Fashion Photography', 'Food Photography', 'Lifestyle Photography'
  ]
};

const skillTags = {
  'Graphics & Design': [
    'photoshop', 'illustrator', 'indesign', 'figma', 'sketch', 'canva',
    'logo', 'branding', 'ui/ux', 'print design', 'digital art', 'vector'
  ],
  'Programming & Tech': [
    'javascript', 'python', 'react', 'nodejs', 'html', 'css', 'php',
    'mysql', 'mongodb', 'aws', 'api', 'frontend', 'backend', 'fullstack'
  ],
  'Digital Marketing': [
    'seo', 'google ads', 'facebook ads', 'instagram', 'content marketing',
    'email marketing', 'social media', 'ppc', 'analytics', 'conversion'
  ],
  'Writing & Translation': [
    'content writing', 'copywriting', 'blog writing', 'technical writing',
    'translation', 'proofreading', 'editing', 'creative writing', 'seo writing'
  ],
  'Video & Animation': [
    'video editing', 'after effects', 'premiere pro', 'animation', 'motion graphics',
    'explainer video', 'whiteboard animation', '3d animation', 'video production'
  ]
};

// Generate sample images (placeholder URLs)
const generateSampleImages = () => {
  const imageCount = faker.number.int({ min: 1, max: 5 });
  const images = [];
  
  for (let i = 0; i < imageCount; i++) {
    images.push(faker.image.urlPicsumPhotos({ width: 800, height: 600 }));
  }
  
  return images;
};

// Generate gig data
const generateGigData = (seller) => {
  const category = faker.helpers.arrayElement(categories);
  const subcategory = faker.helpers.arrayElement(subcategories[category]);
  const tags = faker.helpers.arrayElements(skillTags[category] || [], { min: 3, max: 8 });
  
  // Generate pricing packages
  const basicPrice = faker.number.int({ min: 5, max: 100 });
  const standardPrice = Math.round(basicPrice * faker.number.float({ min: 1.5, max: 2.5 }));
  const premiumPrice = Math.round(standardPrice * faker.number.float({ min: 1.3, max: 2.0 }));
  
  const basicDelivery = faker.number.int({ min: 1, max: 7 });
  const standardDelivery = Math.max(basicDelivery - 2, 1);
  const premiumDelivery = Math.max(standardDelivery - 1, 1);
  
  const packages = {
    basic: {
      title: `Basic ${subcategory}`,
      description: faker.lorem.sentences(2),
      price: basicPrice,
      deliveryTime: basicDelivery,
      revisions: faker.number.int({ min: 1, max: 3 }),
      features: faker.helpers.arrayElements([
        'High Quality Work',
        'Fast Delivery',
        'Professional Service',
        'Unlimited Revisions',
        'Source Files',
        '24/7 Support',
        'Commercial Use Rights'
      ], { min: 2, max: 4 })
    },
    standard: {
      title: `Standard ${subcategory}`,
      description: faker.lorem.sentences(3),
      price: standardPrice,
      deliveryTime: standardDelivery,
      revisions: faker.number.int({ min: 2, max: 5 }),
      features: faker.helpers.arrayElements([
        'High Quality Work',
        'Fast Delivery',
        'Professional Service',
        'Unlimited Revisions',
        'Source Files',
        '24/7 Support',
        'Commercial Use Rights',
        'Multiple Concepts',
        'Rush Delivery'
      ], { min: 4, max: 6 })
    },
    premium: {
      title: `Premium ${subcategory}`,
      description: faker.lorem.sentences(4),
      price: premiumPrice,
      deliveryTime: premiumDelivery,
      revisions: faker.number.int({ min: 3, max: 10 }),
      features: faker.helpers.arrayElements([
        'High Quality Work',
        'Fast Delivery',
        'Professional Service',
        'Unlimited Revisions',
        'Source Files',
        '24/7 Support',
        'Commercial Use Rights',
        'Multiple Concepts',
        'Rush Delivery',
        'Video Consultation',
        'Dedicated Support'
      ], { min: 6, max: 9 })
    }
  };
  
  // Generate realistic stats
  const totalOrders = faker.number.int({ min: 0, max: 500 });
  const totalReviews = Math.floor(totalOrders * faker.number.float({ min: 0.6, max: 0.9 }));
  const totalRating = totalReviews > 0 ? faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }) : 0;
  
  return {
    userId: seller._id,
    title: `I will ${faker.lorem.words({ min: 3, max: 6 })} for ${subcategory.toLowerCase()}`.slice(0, 80),
    category,
    subcategory,
    description: faker.lorem.paragraphs(3, '\n\n'),
    packages,
    price: basicPrice, // For backward compatibility
    deliveryTime: basicDelivery,
    revisions: packages.basic.revisions,
    images: generateSampleImages(),
    tags: tags,
    searchTags: [...tags, ...faker.lorem.words(5).split(' ')],
    totalOrders,
    totalRating,
    totalReviews,
    isActive: faker.datatype.boolean(0.9), // 90% active
    isPaused: faker.datatype.boolean(0.1), // 10% paused
    requirements: [
      {
        question: "Please provide your brand colors and logo",
        type: "text",
        required: true
      },
      {
        question: "What style do you prefer?",
        type: "multiple_choice",
        required: false,
        options: ["Modern", "Classic", "Minimalist", "Bold", "Creative"]
      }
    ],
    faq: [
      {
        question: "How long will it take to complete?",
        answer: `Usually ${basicDelivery} days for the basic package, but it can vary based on complexity.`
      },
      {
        question: "Do you provide source files?",
        answer: "Yes, source files are included in all packages."
      },
      {
        question: "Can you make revisions?",
        answer: `Yes, revisions are included as per the package selected.`
      }
    ]
  };
};

// Create sample sellers
const createSampleSellers = async (count = 200) => {
  console.log(`🔄 Creating ${count} sample sellers...`);
  
  const sellers = [];
  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'India', 'Pakistan', 'Bangladesh', 'Philippines', 'Nigeria',
    'Egypt', 'Brazil', 'Mexico', 'Argentina', 'Spain', 'Italy', 'Poland'
  ];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
    
    const seller = new User({
      username,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: '$2b$10$example.hash.for.seeding.purposes.only', // Placeholder hash
      fullName: `${firstName} ${lastName}`,
      isSeller: true,
      profileImage: faker.image.avatar(),
      country: faker.helpers.arrayElement(countries),
      description: faker.lorem.sentences(3),
      languages: faker.helpers.arrayElements([
        { language: 'English', level: 'Native' },
        { language: 'Spanish', level: 'Fluent' },
        { language: 'French', level: 'Conversational' },
        { language: 'German', level: 'Basic' },
        { language: 'Arabic', level: 'Fluent' },
        { language: 'Hindi', level: 'Native' }
      ], { min: 1, max: 3 }),
      skills: faker.helpers.arrayElements([
        'JavaScript', 'Python', 'React', 'Node.js', 'Design', 'Photography',
        'Writing', 'Marketing', 'SEO', 'Video Editing', 'Animation', 'Translation'
      ], { min: 2, max: 6 }),
      totalRating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
      totalReviews: faker.number.int({ min: 5, max: 200 }),
      completedOrders: faker.number.int({ min: 0, max: 150 }),
      ongoingOrders: faker.number.int({ min: 0, max: 10 }),
      lastSeen: faker.date.recent({ days: 7 })
    });
    
    sellers.push(seller);
    
    if ((i + 1) % 50 === 0) {
      console.log(`   Created ${i + 1}/${count} sellers`);
    }
  }
  
  try {
    await User.insertMany(sellers);
    console.log(`✅ Successfully created ${sellers.length} sellers`);
    return sellers;
  } catch (error) {
    console.error('❌ Error creating sellers:', error);
    throw error;
  }
};

// Create sample gigs
const createSampleGigs = async (sellers, gigsPerSeller = 5) => {
  console.log(`🔄 Creating gigs (${gigsPerSeller} per seller)...`);
  
  const allGigs = [];
  let gigCount = 0;
  
  for (const seller of sellers) {
    const numGigs = faker.number.int({ min: 1, max: gigsPerSeller });
    
    for (let i = 0; i < numGigs; i++) {
      const gigData = generateGigData(seller);
      allGigs.push(gigData);
      gigCount++;
      
      if (gigCount % 100 === 0) {
        console.log(`   Generated ${gigCount} gigs...`);
      }
    }
  }
  
  console.log(`🔄 Inserting ${allGigs.length} gigs into database...`);
  
  try {
    // Insert in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < allGigs.length; i += batchSize) {
      const batch = allGigs.slice(i, i + batchSize);
      await Gig.insertMany(batch);
      console.log(`   Inserted ${Math.min(i + batchSize, allGigs.length)}/${allGigs.length} gigs`);
    }
    
    console.log(`✅ Successfully created ${allGigs.length} gigs`);
    return allGigs;
  } catch (error) {
    console.error('❌ Error creating gigs:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    // Clear existing data (optional - be careful in production!)
    const clearData = process.argv.includes('--clear');
    if (clearData) {
      console.log('🔄 Clearing existing data...');
      await Gig.deleteMany({});
      await User.deleteMany({ isSeller: true });
      console.log('✅ Existing data cleared');
    }
    
    // Create sellers
    const sellers = await createSampleSellers(200);
    
    // Create gigs (5 gigs per seller on average = 1000 gigs)
    await createSampleGigs(sellers, 5);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Sellers created: ${sellers.length}`);
    console.log(`   - Total gigs: ${await Gig.countDocuments()}`);
    console.log(`   - Active gigs: ${await Gig.countDocuments({ isActive: true, isPaused: false })}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  createSampleSellers,
  createSampleGigs
};

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Gig = require('../models/Gig');
const User = require('../models/User');

// Categories and their subcategories
const categories = {
  "Graphics & Design": [
    "Logo Design", "Brand Style Guides", "Business Cards & Stationery", "Web & Mobile Design",
    "Social Media Design", "Packaging & Label Design", "Illustration", "Print Design",
    "Presentation Design", "Infographic Design", "Vector Tracing", "Resume Design"
  ],
  "Digital Marketing": [
    "Social Media Marketing", "SEO", "Content Marketing", "Video Marketing",
    "Email Marketing", "Search Engine Marketing", "Marketing Strategy", "Influencer Marketing",
    "Community Management", "Affiliate Marketing", "Marketing Analytics", "Public Relations"
  ],
  "Writing & Translation": [
    "Content Writing", "Copywriting", "Technical Writing", "Creative Writing",
    "Translation", "Proofreading & Editing", "Resume Writing", "Grant Writing",
    "Scriptwriting", "Speech Writing", "Research & Summaries", "Press Releases"
  ],
  "Video & Animation": [
    "Video Editing", "Animation", "Motion Graphics", "Whiteboard Animation",
    "Video Production", "Explainer Videos", "Character Animation", "Logo Animation",
    "Video Ads", "Slideshow Videos", "Subtitles & Captions", "Video Templates"
  ],
  "Music & Audio": [
    "Voice Over", "Music Production", "Audio Editing", "Sound Design",
    "Mixing & Mastering", "Jingles & Intros", "Podcast Production", "Audio Ads",
    "Meditation Music", "Custom Songs", "Audio Logo & Sonic Branding", "Audiobook Production"
  ],
  "Programming & Tech": [
    "Web Development", "Mobile App Development", "Desktop Applications", "WordPress",
    "E-commerce Development", "Database Design", "API Development", "DevOps & Cloud",
    "Cybersecurity", "Data Analysis", "QA & Testing", "Game Development"
  ],
  "Business": [
    "Business Plans", "Market Research", "Financial Consulting", "Legal Consulting",
    "HR Consulting", "Project Management", "CRM Management", "ERP Management",
    "Supply Chain Management", "Virtual Assistant", "Data Entry", "Lead Generation"
  ],
  "Lifestyle": [
    "Gaming", "Fitness", "Nutrition", "Relationship Advice",
    "Career Counseling", "Life Coaching", "Travel Planning", "Event Planning",
    "Interior Design", "Fashion Consulting", "Beauty & Makeup", "Pet Care"
  ],
  "Data": [
    "Data Entry", "Data Processing", "Data Analysis", "Data Visualization",
    "Data Mining", "Database Administration", "Business Intelligence", "Machine Learning",
    "Statistical Analysis", "Survey Research", "Data Cleaning", "Excel Automation"
  ],
  "Photography": [
    "Portrait Photography", "Product Photography", "Real Estate Photography", "Event Photography",
    "Photo Editing", "Photo Retouching", "Stock Photography", "Food Photography",
    "Fashion Photography", "Wedding Photography", "Nature Photography", "Commercial Photography"
  ]
};

// Sample images from Unsplash (free to use)
const sampleImages = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop"
];

// Generate realistic gig titles based on category
function generateGigTitle(category, subcategory) {
  const titleTemplates = {
    "Graphics & Design": [
      `I will design a professional ${subcategory.toLowerCase()} for your business`,
      `I will create stunning ${subcategory.toLowerCase()} that converts`,
      `I will design modern ${subcategory.toLowerCase()} in 24 hours`,
      `I will create eye-catching ${subcategory.toLowerCase()} for your brand`,
      `I will design premium ${subcategory.toLowerCase()} with unlimited revisions`
    ],
    "Digital Marketing": [
      `I will boost your ${subcategory.toLowerCase()} strategy and ROI`,
      `I will create a comprehensive ${subcategory.toLowerCase()} campaign`,
      `I will optimize your ${subcategory.toLowerCase()} for maximum results`,
      `I will manage your ${subcategory.toLowerCase()} professionally`,
      `I will develop a winning ${subcategory.toLowerCase()} strategy`
    ],
    "Writing & Translation": [
      `I will provide professional ${subcategory.toLowerCase()} services`,
      `I will write engaging ${subcategory.toLowerCase()} content`,
      `I will deliver high-quality ${subcategory.toLowerCase()} work`,
      `I will create compelling ${subcategory.toLowerCase()} copy`,
      `I will provide expert ${subcategory.toLowerCase()} services`
    ],
    "Video & Animation": [
      `I will create professional ${subcategory.toLowerCase()} for your brand`,
      `I will produce engaging ${subcategory.toLowerCase()} content`,
      `I will edit your ${subcategory.toLowerCase()} to perfection`,
      `I will animate stunning ${subcategory.toLowerCase()} videos`,
      `I will create captivating ${subcategory.toLowerCase()} content`
    ],
    "Music & Audio": [
      `I will create professional ${subcategory.toLowerCase()} for your project`,
      `I will produce high-quality ${subcategory.toLowerCase()} content`,
      `I will record amazing ${subcategory.toLowerCase()} for you`,
      `I will mix and master your ${subcategory.toLowerCase()}`,
      `I will deliver broadcast-quality ${subcategory.toLowerCase()}`
    ],
    "Programming & Tech": [
      `I will develop professional ${subcategory.toLowerCase()} solutions`,
      `I will create custom ${subcategory.toLowerCase()} applications`,
      `I will build responsive ${subcategory.toLowerCase()} websites`,
      `I will fix and optimize your ${subcategory.toLowerCase()}`,
      `I will provide expert ${subcategory.toLowerCase()} services`
    ],
    "Business": [
      `I will provide professional ${subcategory.toLowerCase()} consulting`,
      `I will create comprehensive ${subcategory.toLowerCase()} solutions`,
      `I will help you with ${subcategory.toLowerCase()} strategy`,
      `I will deliver expert ${subcategory.toLowerCase()} advice`,
      `I will optimize your ${subcategory.toLowerCase()} processes`
    ],
    "Lifestyle": [
      `I will provide personalized ${subcategory.toLowerCase()} guidance`,
      `I will help you with ${subcategory.toLowerCase()} solutions`,
      `I will create custom ${subcategory.toLowerCase()} plans`,
      `I will offer professional ${subcategory.toLowerCase()} advice`,
      `I will design your perfect ${subcategory.toLowerCase()} experience`
    ],
    "Data": [
      `I will provide accurate ${subcategory.toLowerCase()} services`,
      `I will analyze your ${subcategory.toLowerCase()} professionally`,
      `I will process your ${subcategory.toLowerCase()} efficiently`,
      `I will create insightful ${subcategory.toLowerCase()} reports`,
      `I will handle your ${subcategory.toLowerCase()} needs expertly`
    ],
    "Photography": [
      `I will capture stunning ${subcategory.toLowerCase()} images`,
      `I will provide professional ${subcategory.toLowerCase()} services`,
      `I will edit your ${subcategory.toLowerCase()} to perfection`,
      `I will create beautiful ${subcategory.toLowerCase()} content`,
      `I will deliver high-quality ${subcategory.toLowerCase()} work`
    ]
  };

  const templates = titleTemplates[category] || titleTemplates["Graphics & Design"];
  return faker.helpers.arrayElement(templates);
}

// Generate realistic descriptions
function generateDescription(category, subcategory, title) {
  const intro = faker.helpers.arrayElement([
    "Welcome to my professional service!",
    "Looking for high-quality work?",
    "Need expert help with your project?",
    "Ready to take your business to the next level?",
    "Transform your ideas into reality!"
  ]);

  const experience = faker.helpers.arrayElement([
    `With over ${faker.number.int({ min: 2, max: 10 })} years of experience in ${category.toLowerCase()},`,
    `As a certified professional in ${subcategory.toLowerCase()},`,
    `Having worked with ${faker.number.int({ min: 50, max: 500 })}+ satisfied clients,`,
    `With expertise in ${subcategory.toLowerCase()} and related fields,`,
    `As a specialist in ${category.toLowerCase()},`
  ]);

  const promise = faker.helpers.arrayElement([
    "I guarantee high-quality results that exceed your expectations.",
    "I deliver professional work on time, every time.",
    "I provide unlimited revisions until you're 100% satisfied.",
    "I ensure your project stands out from the competition.",
    "I create solutions that drive real business results."
  ]);

  const features = faker.helpers.arrayElements([
    "✅ Fast delivery",
    "✅ Unlimited revisions",
    "✅ 24/7 communication",
    "✅ Money-back guarantee",
    "✅ Commercial rights included",
    "✅ Source files provided",
    "✅ Professional quality",
    "✅ Custom solutions",
    "✅ Industry expertise",
    "✅ Ongoing support"
  ], { min: 4, max: 7 });

  const cta = faker.helpers.arrayElement([
    "Contact me before placing an order to discuss your specific requirements!",
    "Let's work together to bring your vision to life!",
    "Ready to get started? Send me a message and let's discuss your project!",
    "Don't wait - order now and let's create something amazing together!",
    "Have questions? Feel free to reach out anytime!"
  ]);

  return `${intro}\n\n${experience} ${promise}\n\n${features.join('\n')}\n\n${cta}`;
}

// Generate sample users
async function createSampleUsers(count = 200) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
    
    users.push({
      username,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      fullName: `${firstName} ${lastName}`,
      password: '$2b$10$hashedpassword', // In real app, this would be properly hashed
      isEmailVerified: true,
      profileImage: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${faker.color.rgb().slice(1)}&color=fff`,
      country: faker.location.country(),
      description: faker.lorem.paragraph(),
      languages: faker.helpers.arrayElements([
        { language: 'English', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) },
        { language: 'Spanish', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) },
        { language: 'French', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) },
        { language: 'German', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) },
        { language: 'Italian', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) },
        { language: 'Portuguese', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) },
        { language: 'Chinese', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) },
        { language: 'Japanese', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) },
        { language: 'Arabic', level: faker.helpers.arrayElement(['Basic', 'Conversational', 'Fluent', 'Native']) }
      ], { min: 1, max: 3 }),
      skills: faker.helpers.arrayElements([
        'JavaScript', 'Python', 'React', 'Node.js', 'PHP', 'WordPress', 'Photoshop', 'Illustrator',
        'After Effects', 'Premiere Pro', 'SEO', 'Social Media', 'Content Writing', 'Translation',
        'Logo Design', 'Web Design', 'Mobile Apps', 'Data Analysis', 'Digital Marketing'
      ], { min: 3, max: 8 }),
      totalRating: faker.number.float({ min: 4.0, max: 5.0, precision: 0.1 }),
      totalReviews: faker.number.int({ min: 5, max: 200 }),
      completedOrders: faker.number.int({ min: 10, max: 500 }),
      ongoingOrders: faker.number.int({ min: 0, max: 10 }),
      isSeller: true,
      isActive: true,
      lastSeen: faker.date.recent({ days: 7 })
    });
  }

  return await User.insertMany(users);
}

// Generate gigs
function generateGigs(users, count = 1000) {
  const gigs = [];
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.objectKey(categories);
    const subcategory = faker.helpers.arrayElement(categories[category]);
    const title = generateGigTitle(category, subcategory);
    const description = generateDescription(category, subcategory, title);
    const user = faker.helpers.arrayElement(users);
    
    const basicPrice = faker.number.int({ min: 5, max: 100 });
    const standardPrice = Math.round(basicPrice * faker.number.float({ min: 1.5, max: 2.5 }));
    const premiumPrice = Math.round(standardPrice * faker.number.float({ min: 1.5, max: 2.0 }));
    
    const basicDelivery = faker.number.int({ min: 1, max: 7 });
    const standardDelivery = Math.max(basicDelivery, faker.number.int({ min: 3, max: 14 }));
    const premiumDelivery = Math.max(standardDelivery, faker.number.int({ min: 7, max: 21 }));

    const totalReviews = faker.number.int({ min: 0, max: 150 });
    const totalRating = totalReviews > 0 ? faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }) : 0;

    gigs.push({
      userId: user._id,
      title,
      category,
      subcategory,
      description,
      packages: {
        basic: {
          title: "Basic Package",
          description: faker.lorem.sentence(),
          price: basicPrice,
          deliveryTime: basicDelivery,
          revisions: faker.number.int({ min: 1, max: 3 }),
          features: faker.helpers.arrayElements([
            "High-quality work", "Fast delivery", "Professional service", "Basic support",
            "Source files", "Commercial use", "Responsive design", "SEO optimized"
          ], { min: 2, max: 4 })
        },
        standard: {
          title: "Standard Package",
          description: faker.lorem.sentence(),
          price: standardPrice,
          deliveryTime: standardDelivery,
          revisions: faker.number.int({ min: 2, max: 5 }),
          features: faker.helpers.arrayElements([
            "Everything in Basic", "Premium quality", "Extended support", "Multiple concepts",
            "Advanced features", "Priority support", "Detailed documentation", "Training included"
          ], { min: 3, max: 5 })
        },
        premium: {
          title: "Premium Package",
          description: faker.lorem.sentence(),
          price: premiumPrice,
          deliveryTime: premiumDelivery,
          revisions: faker.number.int({ min: 3, max: 10 }),
          features: faker.helpers.arrayElements([
            "Everything in Standard", "VIP treatment", "Unlimited revisions", "24/7 support",
            "Rush delivery", "Exclusive rights", "Ongoing maintenance", "Personal consultation"
          ], { min: 4, max: 6 })
        }
      },
      price: basicPrice,
      deliveryTime: basicDelivery,
      revisions: faker.number.int({ min: 1, max: 3 }),
      images: faker.helpers.arrayElements(sampleImages, { min: 1, max: 4 }),
      video: faker.datatype.boolean({ probability: 0.3 }) ? faker.internet.url() : undefined,
      tags: faker.helpers.arrayElements([
        category.toLowerCase().replace(/\s+/g, '-'),
        subcategory.toLowerCase().replace(/\s+/g, '-'),
        ...faker.lorem.words(3).split(' ')
      ], { min: 3, max: 8 }),
      searchTags: [
        category.toLowerCase(),
        subcategory.toLowerCase(),
        ...title.toLowerCase().split(' ').filter(word => word.length > 2),
        ...description.toLowerCase().split(' ').filter(word => word.length > 3).slice(0, 10)
      ],
      totalOrders: faker.number.int({ min: 0, max: 300 }),
      totalRating,
      totalReviews,
      isActive: faker.datatype.boolean({ probability: 0.9 }),
      isPaused: faker.datatype.boolean({ probability: 0.1 }),
      requirements: faker.helpers.arrayElements([
        {
          question: "Please provide your brand colors and style preferences",
          type: "text",
          required: true
        },
        {
          question: "What is your target audience?",
          type: "text",
          required: false
        },
        {
          question: "Do you have any reference materials?",
          type: "file",
          required: false
        }
      ], { min: 0, max: 3 }),
      faq: faker.helpers.arrayElements([
        {
          question: "How long will it take to complete my order?",
          answer: `Delivery time depends on the package you choose. Basic: ${basicDelivery} days, Standard: ${standardDelivery} days, Premium: ${premiumDelivery} days.`
        },
        {
          question: "Do you provide revisions?",
          answer: "Yes, I provide revisions as specified in each package. I want to make sure you're 100% satisfied with the final result."
        },
        {
          question: "What do I need to provide to get started?",
          answer: "Please provide your requirements, brand guidelines (if any), and any reference materials that can help me understand your vision."
        }
      ], { min: 1, max: 3 }),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 })
    });
  }
  
  return gigs;
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Gig.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create sample users
    console.log('👥 Creating sample users...');
    const users = await createSampleUsers(200);
    console.log(`✅ Created ${users.length} sample users`);

    // Generate and insert gigs
    console.log('💼 Generating gigs...');
    const gigs = generateGigs(users, 1200);
    
    console.log('💾 Inserting gigs into database...');
    const insertedGigs = await Gig.insertMany(gigs);
    console.log(`✅ Successfully inserted ${insertedGigs.length} gigs`);

    // Verify categories
    const categoriesInDb = await Gig.distinct('category');
    console.log('📊 Categories in database:');
    categoriesInDb.forEach(cat => console.log(`   - ${cat}`));

    // Show some stats
    const stats = await Promise.all([
      Gig.countDocuments({ isActive: true }),
      Gig.countDocuments({ totalReviews: { $gt: 0 } }),
      Gig.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
    ]);

    console.log('\n📈 Database Statistics:');
    console.log(`   - Active gigs: ${stats[0]}`);
    console.log(`   - Gigs with reviews: ${stats[1]}`);
    console.log('   - Gigs per category:');
    stats[2].forEach(stat => console.log(`     ${stat._id}: ${stat.count}`));

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
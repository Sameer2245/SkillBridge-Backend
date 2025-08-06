const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Gig = require('../models/Gig');
const Order = require('../models/Order');

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

// Test users data
const testUsers = [
  {
    username: 'designerpro',
    email: 'designer@test.com',
    password: 'password123',
    isSeller: true,
    fullName: 'Alex Designer',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    description: 'Professional logo designer with 5+ years of experience',
    skills: ['Logo Design', 'Branding', 'Graphic Design', 'Adobe Illustrator'],
    languages: [{ language: 'English', level: 'Native' }],
    country: 'New York, USA'
  },
  {
    username: 'webdev_master',
    email: 'webdev@test.com',
    password: 'password123',
    isSeller: true,
    fullName: 'Sarah Developer',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b72bf780',
    description: 'Full-stack web developer specializing in React and Node.js',
    skills: ['Web Development', 'React', 'Node.js', 'JavaScript'],
    languages: [{ language: 'English', level: 'Native' }],
    country: 'San Francisco, USA'
  },
  {
    username: 'content_writer',
    email: 'writer@test.com',
    password: 'password123',
    isSeller: true,
    fullName: 'Mike Writer',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    description: 'Creative content writer and copywriter',
    skills: ['Content Writing', 'Copywriting', 'SEO Writing', 'Blog Writing'],
    languages: [{ language: 'English', level: 'Native' }],
    country: 'London, UK'
  },
  {
    username: 'test_client',
    email: 'client@test.com',
    password: 'password123',
    isSeller: false,
    fullName: 'John Client',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
    description: 'Looking for quality freelance services',
    country: 'Los Angeles, USA'
  }
];

// Test gigs data
const createTestGigs = (users) => {
const freelancers = users.filter(user => user.isSeller === true);
  console.log('Freelancers found:', freelancers.length);
  console.log('First freelancer:', freelancers[0] ? freelancers[0]._id : 'undefined');
  if (freelancers.length === 0) {
    throw new Error('No freelancers found to assign gigs to.');
  }
  
  return [
    // Logo Design Gigs
    {
      title: 'Professional Logo Design for Your Brand',
      description: 'I will create a unique, professional logo that represents your brand perfectly. With over 5 years of experience in logo design, I understand what makes a logo memorable and effective.',
      category: 'Graphics & Design',
      subcategory: 'Logo Design',
      searchTags: ['logo', 'design', 'branding', 'business', 'identity'],
      userId: freelancers[0]._id,
      price: 50, // legacy field
      deliveryTime: 5, // legacy field
      revisions: 5, // legacy field
      images: [
        'https://images.unsplash.com/photo-1626785774573-4b799315345d',
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71'
      ],
      packages: {
        basic: {
          title: 'Basic Logo',
          description: '1 logo concept, 2 revisions, PNG/JPG files',
          price: 25,
          deliveryTime: 3,
          revisions: 2,
          features: ['1 Logo Concept', '2 Revisions', 'PNG & JPG Files']
        },
        standard: {
          title: 'Standard Package',
          description: '3 logo concepts, 5 revisions, all file formats',
          price: 50,
          deliveryTime: 5,
          revisions: 5,
          features: ['3 Logo Concepts', '5 Revisions', 'All File Formats', 'Vector Files']
        },
        premium: {
          title: 'Premium Brand Package',
          description: '5 logo concepts, unlimited revisions, brand guidelines',
          price: 100,
          deliveryTime: 7,
          revisions: -1,
          features: ['5 Logo Concepts', 'Unlimited Revisions', 'Brand Guidelines', 'Social Media Kit']
        }
      },
      faqs: [
        {
          question: 'What file formats will I receive?',
          answer: 'You will receive PNG, JPG, and vector files (AI, EPS, SVG)'
        },
        {
          question: 'How many revisions are included?',
          answer: 'Basic: 2 revisions, Standard: 5 revisions, Premium: Unlimited'
        }
      ],
      isActive: true,
      featured: true
    },
    {
      title: 'Modern Minimalist Logo Design',
      description: 'Create a clean, modern logo that stands out in today\'s market. I specialize in minimalist design that works across all platforms.',
      category: 'Logo Design',
      subCategory: 'Minimalist Design',
      searchTags: ['minimalist', 'modern', 'logo', 'clean', 'simple'],
      userId: freelancers[0]._id,
      images: [
        'https://images.unsplash.com/photo-1558655146-d09347e92766',
        'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c'
      ],
      packages: {
        basic: {
          title: 'Simple Logo',
          description: '1 minimalist logo concept, 3 revisions',
          price: 35,
          deliveryTime: 2,
          revisions: 3,
          features: ['1 Logo Concept', '3 Revisions', 'PNG Files']
        },
        standard: {
          title: 'Professional Logo',
          description: '2 logo concepts, 5 revisions, source files',
          price: 65,
          deliveryTime: 4,
          revisions: 5,
          features: ['2 Logo Concepts', '5 Revisions', 'Source Files', 'Vector Files']
        },
        premium: {
          title: 'Complete Brand Identity',
          description: '3 concepts, unlimited revisions, brand package',
          price: 120,
          deliveryTime: 6,
          revisions: -1,
          features: ['3 Logo Concepts', 'Unlimited Revisions', 'Brand Package', 'Style Guide']
        }
      },
      isActive: true
    },
    {
      title: 'Vintage Logo Design with Character',
      description: 'Bring your brand to life with a vintage-inspired logo that tells a story. Perfect for businesses wanting a classic, timeless look.',
      category: 'Logo Design',
      subCategory: 'Vintage Design',
      searchTags: ['vintage', 'retro', 'classic', 'logo', 'traditional'],
      userId: freelancers[0]._id,
      images: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5',
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea'
      ],
      packages: {
        basic: {
          title: 'Vintage Logo',
          description: '1 vintage logo design, 2 revisions',
          price: 40,
          deliveryTime: 4,
          revisions: 2,
          features: ['1 Vintage Logo', '2 Revisions', 'High-res Files']
        },
        standard: {
          title: 'Classic Package',
          description: '2 vintage designs, 4 revisions, multiple formats',
          price: 75,
          deliveryTime: 6,
          revisions: 4,
          features: ['2 Logo Designs', '4 Revisions', 'Multiple Formats', 'Color Variations']
        },
        premium: {
          title: 'Heritage Brand Suite',
          description: '3 designs, unlimited revisions, full brand suite',
          price: 150,
          deliveryTime: 8,
          revisions: -1,
          features: ['3 Logo Designs', 'Unlimited Revisions', 'Brand Suite', 'Usage Guidelines']
        }
      },
      isActive: true
    },
    
    // Web Development Gigs
    {
      title: 'Full-Stack Web Application Development',
      description: 'I will build a complete web application using React, Node.js, and MongoDB. Perfect for startups and businesses needing a robust web presence.',
      category: 'Web Development',
      subCategory: 'Full Stack',
      searchTags: ['react', 'nodejs', 'mongodb', 'fullstack', 'webapp'],
      userId: freelancers[1]._id,
      images: [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c'
      ],
      packages: {
        basic: {
          title: 'Simple Web App',
          description: 'Basic web application with 5 pages, responsive design',
          price: 500,
          deliveryTime: 14,
          revisions: 3,
          features: ['5 Pages', 'Responsive Design', 'Basic Features', 'Source Code']
        },
        standard: {
          title: 'Advanced Web App',
          description: 'Full-featured web app with user authentication and database',
          price: 1000,
          deliveryTime: 21,
          revisions: 5,
          features: ['User Authentication', 'Database Integration', 'Admin Panel', 'API Development']
        },
        premium: {
          title: 'Enterprise Solution',
          description: 'Complete enterprise web application with all features',
          price: 2000,
          deliveryTime: 30,
          revisions: 10,
          features: ['Full Enterprise Features', 'Payment Integration', 'Advanced Security', '3 Months Support']
        }
      },
      isActive: true,
      featured: true
    },
    {
      title: 'Responsive Website Design & Development',
      description: 'Create a stunning, mobile-responsive website that looks great on all devices. Using modern web technologies and best practices.',
      category: 'Web Development',
      subCategory: 'Frontend',
      searchTags: ['responsive', 'website', 'html', 'css', 'javascript'],
      userId: freelancers[1]._id,
      images: [
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
      ],
      packages: {
        basic: {
          title: 'Landing Page',
          description: 'Single page responsive website',
          price: 150,
          deliveryTime: 7,
          revisions: 3,
          features: ['1 Page Design', 'Mobile Responsive', 'Contact Form', 'SEO Optimized']
        },
        standard: {
          title: 'Business Website',
          description: 'Multi-page business website with CMS',
          price: 400,
          deliveryTime: 14,
          revisions: 5,
          features: ['Up to 10 Pages', 'Content Management', 'Contact Forms', 'Social Integration']
        },
        premium: {
          title: 'E-commerce Website',
          description: 'Full e-commerce website with payment integration',
          price: 800,
          deliveryTime: 21,
          revisions: 7,
          features: ['E-commerce Features', 'Payment Gateway', 'Inventory Management', 'Analytics']
        }
      },
      isActive: true
    },
    
    // Writing & Content Gigs
    {
      title: 'Professional Blog Writing Services',
      description: 'High-quality, SEO-optimized blog posts that engage your audience and drive traffic. I research thoroughly and write compelling content.',
      category: 'Writing & Translation',
      subCategory: 'Blog Writing',
      searchTags: ['blog', 'writing', 'content', 'seo', 'articles'],
      userId: freelancers[2]._id,
      images: [
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a'
      ],
      packages: {
        basic: {
          title: '500-word Blog Post',
          description: 'Well-researched 500-word blog post with SEO optimization',
          price: 20,
          deliveryTime: 3,
          revisions: 2,
          features: ['500 Words', 'SEO Optimized', '2 Revisions', 'Plagiarism Free']
        },
        standard: {
          title: '1000-word Article',
          description: 'In-depth 1000-word article with images and formatting',
          price: 35,
          deliveryTime: 5,
          revisions: 3,
          features: ['1000 Words', 'Image Suggestions', 'Meta Description', 'Keywords Research']
        },
        premium: {
          title: 'Premium Content Package',
          description: '2000-word comprehensive article with full SEO package',
          price: 60,
          deliveryTime: 7,
          revisions: 5,
          features: ['2000 Words', 'Full SEO Package', 'Social Media Posts', 'Content Strategy']
        }
      },
      isActive: true
    },
    {
      title: 'Copywriting for Marketing & Sales',
      description: 'Persuasive copy that converts visitors into customers. I write compelling sales pages, email campaigns, and marketing materials.',
      category: 'Writing & Translation',
      subCategory: 'Copywriting',
      searchTags: ['copywriting', 'sales', 'marketing', 'conversion', 'persuasive'],
      userId: freelancers[2]._id,
      images: [
        'https://images.unsplash.com/photo-1542626991-cbc4e32524cc',
        'https://images.unsplash.com/photo-1553729459-efe14ef6055d'
      ],
      packages: {
        basic: {
          title: 'Email Campaign',
          description: 'Compelling email sequence (3 emails)',
          price: 45,
          deliveryTime: 3,
          revisions: 2,
          features: ['3 Email Sequence', 'Subject Lines', '2 Revisions', 'A/B Test Versions']
        },
        standard: {
          title: 'Sales Page Copy',
          description: 'Complete sales page copy that converts',
          price: 100,
          deliveryTime: 7,
          revisions: 3,
          features: ['Full Sales Page', 'Headlines & CTAs', 'Benefit-focused Copy', 'Conversion Optimized']
        },
        premium: {
          title: 'Complete Marketing Suite',
          description: 'Full marketing copy package for product launch',
          price: 200,
          deliveryTime: 10,
          revisions: 5,
          features: ['Sales Page + Emails', 'Social Media Copy', 'Ad Copy', 'Landing Pages']
        }
      },
      isActive: true,
      featured: true
    },
    
    // Additional categories
    {
      title: 'Professional Video Editing',
      description: 'Transform your raw footage into polished, professional videos. Perfect for YouTube, social media, or business presentations.',
      category: 'Video & Animation',
      subCategory: 'Video Editing',
      searchTags: ['video', 'editing', 'youtube', 'social media', 'professional'],
      userId: freelancers[0]._id,
      images: [
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d',
        'https://images.unsplash.com/photo-1551818255-e6e10975cd17'
      ],
      packages: {
        basic: {
          title: 'Simple Edit',
          description: 'Basic video editing up to 5 minutes',
          price: 30,
          deliveryTime: 3,
          revisions: 2,
          features: ['Up to 5 Minutes', 'Basic Transitions', 'Color Correction', '2 Revisions']
        },
        standard: {
          title: 'Professional Edit',
          description: 'Advanced editing up to 15 minutes with effects',
          price: 75,
          deliveryTime: 5,
          revisions: 3,
          features: ['Up to 15 Minutes', 'Advanced Effects', 'Audio Enhancement', 'Title Cards']
        },
        premium: {
          title: 'Complete Production',
          description: 'Full video production with motion graphics',
          price: 150,
          deliveryTime: 8,
          revisions: 5,
          features: ['Unlimited Length', 'Motion Graphics', 'Custom Animation', 'Full Production']
        }
      },
      isActive: true
    },
    {
      title: 'Social Media Marketing Strategy',
      description: 'Comprehensive social media strategy to grow your brand online. Includes content planning, posting schedule, and engagement tactics.',
      category: 'Digital Marketing',
      subCategory: 'Social Media',
      searchTags: ['social media', 'marketing', 'strategy', 'content', 'growth'],
      userId: freelancers[1]._id,
      images: [
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113',
        'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07'
      ],
      packages: {
        basic: {
          title: 'Strategy Plan',
          description: 'Basic social media strategy for 1 platform',
          price: 50,
          deliveryTime: 5,
          revisions: 2,
          features: ['1 Platform Strategy', 'Content Calendar', 'Posting Schedule', '2 Revisions']
        },
        standard: {
          title: 'Multi-Platform Strategy',
          description: 'Comprehensive strategy for 3 platforms',
          price: 120,
          deliveryTime: 7,
          revisions: 3,
          features: ['3 Platform Strategy', '30-Day Content Plan', 'Hashtag Research', 'Analytics Setup']
        },
        premium: {
          title: 'Complete Marketing Suite',
          description: 'Full social media marketing package',
          price: 250,
          deliveryTime: 10,
          revisions: 5,
          features: ['All Platform Strategy', '90-Day Plan', 'Ad Campaign Setup', 'Monthly Consultations']
        }
      },
      isActive: true
    }
  ];
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Create users
    const hashedUsers = await Promise.all(
      testUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return { ...user, password: hashedPassword };
      })
    );
    
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`👥 Created ${createdUsers.length} test users`);
    
    // Create gigs
    const testGigs = createTestGigs(createdUsers);
    const createdGigs = await Gig.insertMany(testGigs);
    console.log(`🎯 Created ${createdGigs.length} test gigs`);
    
    // Create some sample orders
    const sampleOrders = [
      {
        buyerId: createdUsers.find(u => u.isSeller === false)._id,
        sellerId: createdUsers.find(u => u.username === 'designerpro')._id,
        gigId: createdGigs[0]._id,
        packageType: 'standard',
        title: 'Professional Logo Design - Standard Package',
        description: '3 logo concepts, 5 revisions, all file formats',
        price: 50,
        serviceFee: 2.50,
        totalAmount: 52.50,
        deliveryTime: 5,
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        maxRevisions: 5,
        requirements: ['Company name: TechStart', 'Industry: Technology', 'Style: Modern and clean'],
        status: 'active',
        paymentStatus: 'paid'
      }
    ];
    
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`📦 Created ${createdOrders.length} sample orders`);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Gigs: ${createdGigs.length}`);
    console.log(`   Orders: ${createdOrders.length}`);
    
    console.log('\n👤 Test Accounts:');
    console.log('   Freelancer: designer@test.com / password123');
    console.log('   Developer: webdev@test.com / password123');
    console.log('   Writer: writer@test.com / password123');
    console.log('   Client: client@test.com / password123');
    
    console.log('\n🎯 Categories available:');
    console.log('   - Logo Design (3 gigs)');
    console.log('   - Web Development (2 gigs)');
    console.log('   - Writing & Translation (2 gigs)');
    console.log('   - Video & Animation (1 gig)');
    console.log('   - Digital Marketing (1 gig)');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Run seeding
if (require.main === module) {
  connectDB().then(seedDatabase);
}

module.exports = { seedDatabase, connectDB };

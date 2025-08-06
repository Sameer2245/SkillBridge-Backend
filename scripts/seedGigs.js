const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Gig.deleteMany({});

    // Create sample users (sellers)
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        username: 'sarah_dev',
        email: 'sarah@example.com',
        password: hashedPassword,
        fullName: 'Sarah Johnson',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        description: 'Full-stack developer with 5+ years of experience',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        languages: [{ language: 'English', level: 'Native' }],
        country: 'United States',
        totalRating: 4.9,
        totalReviews: 127,
        completedOrders: 89
      },
      {
        username: 'alex_design',
        email: 'alex@example.com',
        password: hashedPassword,
        fullName: 'Alex Chen',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        description: 'Creative designer specializing in branding and logos',
        skills: ['Photoshop', 'Illustrator', 'Branding', 'Logo Design'],
        languages: [
          { language: 'English', level: 'Fluent' },
          { language: 'Chinese', level: 'Native' }
        ],
        country: 'Canada',
        totalRating: 4.8,
        totalReviews: 89,
        completedOrders: 156
      },
      {
        username: 'maria_writer',
        email: 'maria@example.com',
        password: hashedPassword,
        fullName: 'Maria Rodriguez',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        description: 'Professional content writer and SEO specialist',
        skills: ['Content Writing', 'SEO', 'Copywriting', 'Blog Writing'],
        languages: [
          { language: 'English', level: 'Fluent' },
          { language: 'Spanish', level: 'Native' }
        ],
        country: 'Spain',
        totalRating: 4.7,
        totalReviews: 64,
        completedOrders: 78
      },
      {
        username: 'david_ux',
        email: 'david@example.com',
        password: hashedPassword,
        fullName: 'David Kim',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        description: 'UX/UI designer with expertise in mobile app design',
        skills: ['UI/UX Design', 'Figma', 'Sketch', 'Prototyping'],
        languages: [
          { language: 'English', level: 'Fluent' },
          { language: 'Korean', level: 'Native' }
        ],
        country: 'South Korea',
        totalRating: 4.9,
        totalReviews: 203,
        completedOrders: 145
      },
      {
        username: 'emma_social',
        email: 'emma@example.com',
        password: hashedPassword,
        fullName: 'Emma Wilson',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        description: 'Social media marketing expert and content strategist',
        skills: ['Social Media Marketing', 'Content Strategy', 'Facebook Ads', 'Instagram Marketing'],
        languages: [{ language: 'English', level: 'Native' }],
        country: 'United Kingdom',
        totalRating: 4.6,
        totalReviews: 92,
        completedOrders: 67
      },
      {
        username: 'john_wp',
        email: 'john@example.com',
        password: hashedPassword,
        fullName: 'John Smith',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
        description: 'WordPress developer and website specialist',
        skills: ['WordPress', 'PHP', 'MySQL', 'Custom Themes'],
        languages: [{ language: 'English', level: 'Native' }],
        country: 'Australia',
        totalRating: 4.5,
        totalReviews: 45,
        completedOrders: 34
      }
    ]);

    // Create sample gigs
    const gigs = [
      {
        userId: users[0]._id,
        title: 'I will create a modern responsive website for your business',
        category: 'Programming & Tech',
        subcategory: 'Website Development',
        description: 'Professional web development with React, Node.js, and modern design principles. I will create a fully responsive website that works perfectly on all devices.',
        packages: {
          basic: {
            title: 'Basic Website',
            description: 'Simple responsive website with up to 5 pages',
            price: 299,
            deliveryTime: 7,
            revisions: 2,
            features: ['Responsive Design', 'Contact Form', 'SEO Optimized']
          },
          standard: {
            title: 'Standard Website',
            description: 'Professional website with advanced features',
            price: 599,
            deliveryTime: 10,
            revisions: 3,
            features: ['Everything in Basic', 'CMS Integration', 'Payment Gateway', 'Analytics']
          },
          premium: {
            title: 'Premium Website',
            description: 'Complete web solution with custom features',
            price: 999,
            deliveryTime: 14,
            revisions: 5,
            features: ['Everything in Standard', 'Custom Features', 'API Integration', 'Performance Optimization']
          }
        },
        price: 299,
        deliveryTime: 7,
        revisions: 2,
        images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'],
        tags: ['react', 'nodejs', 'responsive', 'modern', 'website'],
        searchTags: ['react', 'nodejs', 'responsive', 'modern', 'website', 'web', 'development'],
        totalOrders: 89,
        totalRating: 4.9,
        totalReviews: 127,
        isActive: true,
        isPaused: false
      },
      {
        userId: users[1]._id,
        title: 'I will design a professional logo and brand identity',
        category: 'Graphics & Design',
        subcategory: 'Logo Design',
        description: 'Creative logo design with unlimited revisions and brand guidelines. Get a professional logo that represents your brand perfectly.',
        packages: {
          basic: {
            title: 'Logo Only',
            description: 'Professional logo design with 3 concepts',
            price: 150,
            deliveryTime: 3,
            revisions: 3,
            features: ['3 Logo Concepts', 'High Resolution Files', 'Commercial License']
          },
          standard: {
            title: 'Logo + Brand Kit',
            description: 'Logo design with basic brand identity',
            price: 300,
            deliveryTime: 5,
            revisions: 5,
            features: ['Everything in Basic', 'Business Card Design', 'Letterhead', 'Brand Colors']
          },
          premium: {
            title: 'Complete Brand Identity',
            description: 'Full brand identity package',
            price: 500,
            deliveryTime: 7,
            revisions: 7,
            features: ['Everything in Standard', 'Brand Guidelines', 'Social Media Kit', 'Website Mockup']
          }
        },
        price: 150,
        deliveryTime: 3,
        revisions: 3,
        images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop'],
        tags: ['logo', 'branding', 'creative', 'professional', 'design'],
        searchTags: ['logo', 'branding', 'creative', 'professional', 'design', 'identity'],
        totalOrders: 156,
        totalRating: 4.8,
        totalReviews: 89,
        isActive: true,
        isPaused: false
      },
      {
        userId: users[2]._id,
        title: 'I will write SEO optimized content for your website',
        category: 'Writing & Translation',
        subcategory: 'Content Writing',
        description: 'High-quality content writing that ranks well and converts visitors. Professional SEO-optimized articles and web content.',
        packages: {
          basic: {
            title: 'Basic Article',
            description: 'SEO optimized article up to 500 words',
            price: 75,
            deliveryTime: 3,
            revisions: 2,
            features: ['SEO Optimized', 'Keyword Research', 'Plagiarism Free']
          },
          standard: {
            title: 'Premium Article',
            description: 'In-depth article up to 1000 words',
            price: 150,
            deliveryTime: 5,
            revisions: 3,
            features: ['Everything in Basic', 'Meta Description', 'Internal Linking', 'Images']
          },
          premium: {
            title: 'Content Package',
            description: 'Multiple articles with content strategy',
            price: 300,
            deliveryTime: 7,
            revisions: 4,
            features: ['Everything in Standard', '3 Articles', 'Content Calendar', 'Social Media Posts']
          }
        },
        price: 75,
        deliveryTime: 3,
        revisions: 2,
        images: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop'],
        tags: ['seo', 'content', 'writing', 'marketing', 'articles'],
        searchTags: ['seo', 'content', 'writing', 'marketing', 'articles', 'blog'],
        totalOrders: 78,
        totalRating: 4.7,
        totalReviews: 64,
        isActive: true,
        isPaused: false
      },
      {
        userId: users[3]._id,
        title: 'I will create a mobile app UI/UX design',
        category: 'Graphics & Design',
        subcategory: 'Mobile App Design',
        description: 'Modern mobile app design with user-centered approach and prototyping. Create stunning mobile interfaces that users love.',
        packages: {
          basic: {
            title: 'Basic UI Design',
            description: 'Mobile app UI design for up to 5 screens',
            price: 500,
            deliveryTime: 7,
            revisions: 3,
            features: ['5 Screen Designs', 'Mobile Optimized', 'Design Files']
          },
          standard: {
            title: 'UI/UX Package',
            description: 'Complete UI/UX design with wireframes',
            price: 800,
            deliveryTime: 10,
            revisions: 4,
            features: ['Everything in Basic', 'Wireframes', 'User Flow', 'Prototype']
          },
          premium: {
            title: 'Complete App Design',
            description: 'Full app design with all screens and assets',
            price: 1200,
            deliveryTime: 14,
            revisions: 5,
            features: ['Everything in Standard', 'All Screens', 'Icon Set', 'Style Guide', 'Developer Handoff']
          }
        },
        price: 500,
        deliveryTime: 7,
        revisions: 3,
        images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop'],
        tags: ['mobile', 'ui', 'ux', 'app design', 'figma'],
        searchTags: ['mobile', 'ui', 'ux', 'app', 'design', 'figma', 'prototype'],
        totalOrders: 145,
        totalRating: 4.9,
        totalReviews: 203,
        isActive: true,
        isPaused: false
      },
      {
        userId: users[4]._id,
        title: 'I will create engaging social media content and strategy',
        category: 'Digital Marketing',
        subcategory: 'Social Media Marketing',
        description: 'Complete social media management with content creation and analytics. Boost your social media presence with professional content.',
        packages: {
          basic: {
            title: 'Content Creation',
            description: 'Social media content for 1 week',
            price: 200,
            deliveryTime: 5,
            revisions: 2,
            features: ['7 Posts', 'Captions', 'Hashtags', '1 Platform']
          },
          standard: {
            title: 'Social Media Package',
            description: 'Complete social media management for 1 month',
            price: 500,
            deliveryTime: 7,
            revisions: 3,
            features: ['Everything in Basic', '30 Posts', '3 Platforms', 'Content Calendar', 'Analytics']
          },
          premium: {
            title: 'Full Strategy',
            description: 'Complete social media strategy and management',
            price: 1000,
            deliveryTime: 10,
            revisions: 4,
            features: ['Everything in Standard', 'Strategy Document', 'Competitor Analysis', 'Ad Campaign Setup']
          }
        },
        price: 200,
        deliveryTime: 5,
        revisions: 2,
        images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'],
        tags: ['social media', 'content', 'marketing', 'strategy', 'instagram'],
        searchTags: ['social', 'media', 'content', 'marketing', 'strategy', 'instagram', 'facebook'],
        totalOrders: 67,
        totalRating: 4.6,
        totalReviews: 92,
        isActive: true,
        isPaused: false
      },
      {
        userId: users[5]._id,
        title: 'I will develop a custom WordPress website',
        category: 'Programming & Tech',
        subcategory: 'WordPress',
        description: 'Professional WordPress development with custom themes and plugins. Get a powerful WordPress website tailored to your needs.',
        packages: {
          basic: {
            title: 'Basic WordPress Site',
            description: 'Custom WordPress website with basic features',
            price: 350,
            deliveryTime: 10,
            revisions: 2,
            features: ['Custom Theme', 'Responsive Design', 'Contact Form', 'SEO Setup']
          },
          standard: {
            title: 'Advanced WordPress',
            description: 'WordPress site with advanced functionality',
            price: 650,
            deliveryTime: 14,
            revisions: 3,
            features: ['Everything in Basic', 'E-commerce', 'Custom Plugins', 'Performance Optimization']
          },
          premium: {
            title: 'Enterprise WordPress',
            description: 'Complete WordPress solution with all features',
            price: 1200,
            deliveryTime: 21,
            revisions: 4,
            features: ['Everything in Standard', 'Multi-site Setup', 'Advanced Security', 'Maintenance Plan']
          }
        },
        price: 350,
        deliveryTime: 10,
        revisions: 2,
        images: ['https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop'],
        tags: ['wordpress', 'cms', 'custom', 'development', 'php'],
        searchTags: ['wordpress', 'cms', 'custom', 'development', 'php', 'website'],
        totalOrders: 34,
        totalRating: 4.5,
        totalReviews: 45,
        isActive: true,
        isPaused: false
      }
    ];

    await Gig.insertMany(gigs);

    console.log('Sample data seeded successfully!');
    console.log(`Created ${users.length} users and ${gigs.length} gigs`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();
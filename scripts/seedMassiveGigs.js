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

// Helper function to generate random values
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomRating = () => (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);

const seedMassiveData = async () => {
  try {
    // Don't clear existing data, just add more
    console.log('Adding more gigs to existing data...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create more diverse users
    const additionalUsers = [];
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Helen', 'Donald', 'Sandra'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
    const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'India', 'Pakistan', 'Bangladesh', 'Philippines', 'Brazil', 'Argentina', 'Mexico', 'Colombia', 'Ukraine', 'Poland'];
    const profileImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face'
    ];

    // Create 20 more users
    for (let i = 0; i < 20; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`;
      
      additionalUsers.push({
        username,
        email: `${username}@example.com`,
        password: hashedPassword,
        fullName: `${firstName} ${lastName}`,
        isSeller: true,
        profileImage: getRandomElement(profileImages),
        description: `Professional freelancer with expertise in various fields`,
        skills: ['Professional Service', 'Quality Work', 'Fast Delivery'],
        languages: [{ language: 'English', level: 'Fluent' }],
        country: getRandomElement(countries),
        totalRating: parseFloat(getRandomRating()),
        totalReviews: getRandomNumber(10, 200),
        completedOrders: getRandomNumber(5, 150)
      });
    }

    const newUsers = await User.insertMany(additionalUsers);
    const allUsers = await User.find({});

    // Gig templates for different categories
    const gigTemplates = {
      'Programming & Tech': {
        'Website Development': [
          {
            title: 'I will create a stunning landing page that converts visitors',
            description: 'High-converting landing page design and development with modern UI/UX principles.',
            tags: ['landing page', 'conversion', 'web design', 'html', 'css'],
            images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop']
          },
          {
            title: 'I will build an e-commerce website with payment integration',
            description: 'Complete e-commerce solution with shopping cart, payment gateway, and admin panel.',
            tags: ['ecommerce', 'online store', 'payment', 'shopping cart', 'web development'],
            images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop']
          },
          {
            title: 'I will develop a custom web application for your business',
            description: 'Tailored web application development to meet your specific business requirements.',
            tags: ['web app', 'custom development', 'business solution', 'database', 'api'],
            images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop']
          }
        ],
        'WordPress': [
          {
            title: 'I will fix WordPress issues and bugs quickly',
            description: 'Expert WordPress troubleshooting and bug fixing service. Get your site working perfectly.',
            tags: ['wordpress', 'bug fix', 'troubleshooting', 'maintenance', 'php'],
            images: ['https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop']
          },
          {
            title: 'I will optimize your WordPress site for speed and SEO',
            description: 'Complete WordPress optimization for faster loading times and better search rankings.',
            tags: ['wordpress', 'optimization', 'speed', 'seo', 'performance'],
            images: ['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop']
          }
        ],
        'Mobile Apps': [
          {
            title: 'I will create a native iOS app for your business',
            description: 'Professional iOS app development using Swift and latest iOS technologies.',
            tags: ['ios', 'swift', 'mobile app', 'iphone', 'app store'],
            images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop']
          },
          {
            title: 'I will develop an Android app with modern design',
            description: 'Native Android app development with Material Design and latest Android features.',
            tags: ['android', 'kotlin', 'mobile app', 'google play', 'material design'],
            images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop']
          }
        ]
      },
      'Graphics & Design': {
        'Logo Design': [
          {
            title: 'I will design a minimalist logo for your startup',
            description: 'Clean, modern, and memorable logo design that represents your brand perfectly.',
            tags: ['logo', 'minimalist', 'startup', 'branding', 'modern'],
            images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop']
          },
          {
            title: 'I will create a vintage logo with hand-drawn elements',
            description: 'Unique vintage-style logo design with custom hand-drawn illustrations.',
            tags: ['logo', 'vintage', 'hand drawn', 'retro', 'custom'],
            images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop']
          }
        ],
        'Web Design': [
          {
            title: 'I will design a modern website mockup in Figma',
            description: 'Professional website design mockup with modern UI/UX principles in Figma.',
            tags: ['web design', 'figma', 'mockup', 'ui ux', 'modern'],
            images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop']
          },
          {
            title: 'I will create stunning social media graphics',
            description: 'Eye-catching social media graphics for all platforms to boost your engagement.',
            tags: ['social media', 'graphics', 'instagram', 'facebook', 'design'],
            images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop']
          }
        ]
      },
      'Writing & Translation': {
        'Content Writing': [
          {
            title: 'I will write SEO-optimized product descriptions',
            description: 'Compelling product descriptions that rank well and convert visitors into customers.',
            tags: ['product description', 'seo', 'copywriting', 'ecommerce', 'content'],
            images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop']
          },
          {
            title: 'I will create engaging email marketing campaigns',
            description: 'High-converting email sequences that nurture leads and drive sales.',
            tags: ['email marketing', 'copywriting', 'campaigns', 'conversion', 'sales'],
            images: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop']
          }
        ],
        'Translation': [
          {
            title: 'I will translate documents from English to Spanish',
            description: 'Professional translation service with native Spanish speaker accuracy.',
            tags: ['translation', 'spanish', 'english', 'documents', 'native'],
            images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop']
          }
        ]
      },
      'Digital Marketing': {
        'SEO': [
          {
            title: 'I will do complete SEO audit of your website',
            description: 'Comprehensive SEO analysis with actionable recommendations to improve rankings.',
            tags: ['seo audit', 'website analysis', 'google ranking', 'optimization', 'report'],
            images: ['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop']
          },
          {
            title: 'I will build high-quality backlinks for your website',
            description: 'White-hat link building service to improve your domain authority and rankings.',
            tags: ['backlinks', 'link building', 'seo', 'domain authority', 'white hat'],
            images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop']
          }
        ],
        'Social Media Marketing': [
          {
            title: 'I will run Facebook ads campaign for your business',
            description: 'Professional Facebook advertising to reach your target audience and drive conversions.',
            tags: ['facebook ads', 'social media', 'advertising', 'marketing', 'campaigns'],
            images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop']
          }
        ]
      },
      'Video & Animation': {
        'Video Editing': [
          {
            title: 'I will edit your YouTube videos professionally',
            description: 'Professional YouTube video editing with engaging cuts, transitions, and effects.',
            tags: ['youtube', 'video editing', 'content creation', 'editing', 'social media'],
            images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop']
          },
          {
            title: 'I will create promotional videos for your business',
            description: 'Engaging promotional videos that showcase your products and services effectively.',
            tags: ['promotional video', 'business video', 'marketing', 'advertising', 'commercial'],
            images: ['https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=800&h=600&fit=crop']
          }
        ]
      },
      'Music & Audio': {
        'Voice Over': [
          {
            title: 'I will record a professional commercial voiceover',
            description: 'Broadcast-quality voiceover for commercials, ads, and promotional content.',
            tags: ['voiceover', 'commercial', 'advertising', 'professional', 'broadcast'],
            images: ['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop']
          },
          {
            title: 'I will create custom background music for your project',
            description: 'Original background music composition tailored to your project needs.',
            tags: ['background music', 'composition', 'original music', 'soundtrack', 'audio'],
            images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop']
          }
        ]
      }
    };

    // Generate many gigs
    const massiveGigs = [];
    let gigCount = 0;

    for (const [category, subcategories] of Object.entries(gigTemplates)) {
      for (const [subcategory, templates] of Object.entries(subcategories)) {
        // Create multiple gigs for each template
        for (const template of templates) {
          // Create 3-5 variations of each template
          const variations = getRandomNumber(3, 5);
          
          for (let v = 0; v < variations; v++) {
            const user = getRandomElement(allUsers);
            const basePrice = getRandomNumber(15, 500);
            const deliveryTime = getRandomNumber(1, 14);
            
            massiveGigs.push({
              userId: user._id,
              title: template.title,
              category,
              subcategory,
              description: template.description,
              packages: {
                basic: {
                  title: 'Basic Package',
                  description: 'Essential features to get you started',
                  price: basePrice,
                  deliveryTime: deliveryTime,
                  revisions: getRandomNumber(1, 3),
                  features: ['High Quality Work', 'Fast Delivery', 'Professional Service']
                },
                standard: {
                  title: 'Standard Package',
                  description: 'Enhanced features for better results',
                  price: Math.round(basePrice * 1.8),
                  deliveryTime: deliveryTime + getRandomNumber(2, 5),
                  revisions: getRandomNumber(2, 4),
                  features: ['Everything in Basic', 'Premium Features', 'Priority Support', 'Extended Revisions']
                },
                premium: {
                  title: 'Premium Package',
                  description: 'Complete solution with all features',
                  price: Math.round(basePrice * 3),
                  deliveryTime: deliveryTime + getRandomNumber(5, 10),
                  revisions: getRandomNumber(3, 6),
                  features: ['Everything in Standard', 'VIP Treatment', 'Unlimited Revisions', 'Express Delivery']
                }
              },
              price: basePrice,
              deliveryTime: deliveryTime,
              revisions: getRandomNumber(1, 3),
              images: template.images,
              tags: template.tags,
              searchTags: [...template.tags, category.toLowerCase(), subcategory.toLowerCase()],
              totalOrders: getRandomNumber(5, 200),
              totalRating: parseFloat(getRandomRating()),
              totalReviews: getRandomNumber(10, 300),
              isActive: true,
              isPaused: false
            });
            
            gigCount++;
          }
        }
      }
    }

    // Add some additional random gigs for variety
    const additionalCategories = [
      { category: 'Business', subcategory: 'Business Plans', title: 'I will write a comprehensive business plan', description: 'Professional business plan writing service for startups and established businesses.' },
      { category: 'Business', subcategory: 'Market Research', title: 'I will conduct detailed market research for your business', description: 'In-depth market analysis to help you understand your target audience and competition.' },
      { category: 'Lifestyle', subcategory: 'Gaming', title: 'I will coach you to improve your gaming skills', description: 'Professional gaming coaching to help you reach the next level in your favorite games.' },
      { category: 'Lifestyle', subcategory: 'Fitness', title: 'I will create a personalized workout plan', description: 'Custom fitness program designed specifically for your goals and fitness level.' },
      { category: 'Programming & Tech', subcategory: 'AI Services', title: 'I will integrate AI chatbot into your website', description: 'Smart AI chatbot integration to improve customer service and engagement.' },
      { category: 'Programming & Tech', subcategory: 'Blockchain', title: 'I will develop smart contracts for your project', description: 'Professional smart contract development for blockchain applications.' },
      { category: 'Data', subcategory: 'Data Visualization', title: 'I will create stunning data visualizations', description: 'Professional data visualization and dashboard creation for business insights.' },
      { category: 'Photography', subcategory: 'Product Photography', title: 'I will take professional product photos', description: 'High-quality product photography for e-commerce and marketing materials.' },
      { category: 'Photography', subcategory: 'Portrait Photography', title: 'I will create professional headshots', description: 'Professional portrait photography for business profiles and social media.' }
    ];

    for (const template of additionalCategories) {
      const variations = getRandomNumber(2, 4);
      
      for (let v = 0; v < variations; v++) {
        const user = getRandomElement(allUsers);
        const basePrice = getRandomNumber(25, 800);
        const deliveryTime = getRandomNumber(2, 21);
        
        massiveGigs.push({
          userId: user._id,
          title: template.title,
          category: template.category,
          subcategory: template.subcategory,
          description: template.description,
          packages: {
            basic: {
              title: 'Basic Service',
              description: 'Essential service package',
              price: basePrice,
              deliveryTime: deliveryTime,
              revisions: getRandomNumber(1, 3),
              features: ['Professional Quality', 'Timely Delivery', 'Customer Support']
            },
            standard: {
              title: 'Standard Service',
              description: 'Enhanced service with additional features',
              price: Math.round(basePrice * 2),
              deliveryTime: deliveryTime + getRandomNumber(3, 7),
              revisions: getRandomNumber(2, 4),
              features: ['Everything in Basic', 'Advanced Features', 'Priority Support']
            },
            premium: {
              title: 'Premium Service',
              description: 'Complete premium solution',
              price: Math.round(basePrice * 3.5),
              deliveryTime: deliveryTime + getRandomNumber(7, 14),
              revisions: getRandomNumber(4, 8),
              features: ['Everything in Standard', 'VIP Service', 'Comprehensive Solution']
            }
          },
          price: basePrice,
          deliveryTime: deliveryTime,
          revisions: getRandomNumber(1, 3),
          images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop'],
          tags: [template.subcategory.toLowerCase(), template.category.toLowerCase(), 'professional', 'quality'],
          searchTags: [template.subcategory.toLowerCase(), template.category.toLowerCase(), 'professional', 'quality', 'service'],
          totalOrders: getRandomNumber(1, 150),
          totalRating: parseFloat(getRandomRating()),
          totalReviews: getRandomNumber(5, 200),
          isActive: true,
          isPaused: false
        });
        
        gigCount++;
      }
    }

    await Gig.insertMany(massiveGigs);

    console.log('Massive gig data seeded successfully!');
    console.log(`Added ${newUsers.length} new users and ${gigCount} new gigs`);
    console.log(`Total gigs in database: ${await Gig.countDocuments()}`);
    
  } catch (error) {
    console.error('Error seeding massive data:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  seedMassiveData();
});
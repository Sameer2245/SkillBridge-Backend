const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../models/User');
const Gig = require('../models/Gig');

// Load environment variables from the server directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedPaymentTestData = async () => {
  try {
    console.log('🌱 Starting payment test data seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test data (optional)
    // await User.deleteMany({ email: { $in: ['seller@test.com', 'buyer@test.com'] } });
    // await Gig.deleteMany({ title: { $regex: /Test Gig/i } });

    // Create test seller
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    let seller = await User.findOne({ email: 'seller@test.com' });
    if (!seller) {
      seller = new User({
        username: 'sarah_dev',
        email: 'seller@test.com',
        password: hashedPassword,
        fullName: 'Sarah Johnson',
        userType: 'seller',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        description: 'Full-stack developer with 6+ years of experience creating stunning websites and web applications.',
        skills: ['React', 'Node.js', 'MongoDB', 'UI/UX Design', 'JavaScript', 'HTML/CSS'],
        languages: [
          { language: 'English', level: 'Native' },
          { language: 'Spanish', level: 'Conversational' }
        ],
        location: 'San Francisco, CA',
        responseTime: 1, // 1 hour
        isEmailVerified: true,
        stats: {
          totalOrders: 89,
          completedOrders: 85,
          ongoingOrders: 4,
          totalEarnings: 25000,
          averageRating: 4.9,
          totalReviews: 127
        }
      });
      await seller.save();
      console.log('✅ Test seller created');
    } else {
      console.log('✅ Test seller already exists');
    }

    // Create test buyer
    let buyer = await User.findOne({ email: 'buyer@test.com' });
    if (!buyer) {
      buyer = new User({
        username: 'john_buyer',
        email: 'buyer@test.com',
        password: hashedPassword,
        fullName: 'John Smith',
        userType: 'buyer',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        description: 'Business owner looking for quality freelance services.',
        location: 'New York, NY',
        isEmailVerified: true
      });
      await buyer.save();
      console.log('✅ Test buyer created');
    } else {
      console.log('✅ Test buyer already exists');
    }

    // Create test gigs
    const testGigs = [
      {
        userId: seller._id,
        title: 'I will create a modern responsive website for your business',
        category: 'Programming & Tech',
        subcategory: 'Website Development',
        description: 'Transform your business with a stunning, modern website that converts visitors into customers. I specialize in creating responsive, SEO-optimized websites that look great on all devices.',
        packages: {
          basic: {
            title: 'Basic Website',
            description: 'Up to 5 pages with responsive design and basic SEO',
            price: 299,
            deliveryTime: 7,
            revisions: 2,
            features: [
              'Up to 5 pages',
              'Responsive design',
              'Basic SEO',
              'Contact form',
              '2 revisions'
            ]
          },
          standard: {
            title: 'Standard Website',
            description: 'Up to 10 pages with CMS integration and advanced SEO',
            price: 599,
            deliveryTime: 10,
            revisions: 3,
            features: [
              'Up to 10 pages',
              'Responsive design',
              'Advanced SEO',
              'Contact form',
              'Social media integration',
              'CMS integration',
              '3 revisions'
            ]
          },
          premium: {
            title: 'Premium Website',
            description: 'Unlimited pages with e-commerce functionality',
            price: 999,
            deliveryTime: 14,
            revisions: 5,
            features: [
              'Unlimited pages',
              'Responsive design',
              'Advanced SEO',
              'Contact form',
              'Social media integration',
              'CMS integration',
              'E-commerce functionality',
              'Analytics setup',
              '5 revisions',
              '60 days support'
            ]
          }
        },
        // Legacy fields for backward compatibility
        price: 299,
        deliveryTime: 7,
        revisions: 2,
        images: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop'
        ],
        tags: ['react', 'nodejs', 'responsive', 'modern', 'business', 'website'],
        searchTags: ['web development', 'react developer', 'responsive design', 'modern website'],
        requirements: [
          {
            question: 'What is your business name and industry?',
            type: 'text',
            required: true
          },
          {
            question: 'Do you have existing branding materials (logo, colors, fonts)?',
            type: 'text',
            required: true
          },
          {
            question: 'What are the main goals of your website?',
            type: 'text',
            required: true
          },
          {
            question: 'Do you have any reference websites you like?',
            type: 'text',
            required: false
          }
        ],
        faq: [
          {
            question: 'Do you provide hosting?',
            answer: 'I can help you set up hosting, but hosting costs are separate. I recommend reliable providers and can assist with the setup.'
          },
          {
            question: 'Will my website be mobile-friendly?',
            answer: 'Absolutely! All websites I create are fully responsive and optimized for mobile devices.'
          },
          {
            question: 'Can you help with SEO?',
            answer: 'Yes, I include basic SEO optimization in all packages, with advanced SEO available in Standard and Premium packages.'
          }
        ],
        totalOrders: 89,
        totalRating: 4.9 * 127,
        totalReviews: 127,
        isActive: true
      },
      {
        userId: seller._id,
        title: 'I will design a professional logo for your brand',
        category: 'Graphics & Design',
        subcategory: 'Logo Design',
        description: 'Get a unique, professional logo that represents your brand perfectly. I create memorable designs that help your business stand out.',
        packages: {
          basic: {
            title: 'Basic Logo',
            description: '1 logo concept with 2 revisions',
            price: 150,
            deliveryTime: 3,
            revisions: 2,
            features: [
              '1 logo concept',
              'High-resolution files',
              'PNG & JPG formats',
              '2 revisions'
            ]
          },
          standard: {
            title: 'Standard Logo Package',
            description: '3 logo concepts with source files',
            price: 300,
            deliveryTime: 5,
            revisions: 3,
            features: [
              '3 logo concepts',
              'High-resolution files',
              'PNG, JPG & PDF formats',
              'Source files included',
              '3 revisions'
            ]
          },
          premium: {
            title: 'Complete Brand Package',
            description: 'Full brand identity with multiple variations',
            price: 500,
            deliveryTime: 7,
            revisions: 5,
            features: [
              '5 logo concepts',
              'Brand guidelines',
              'Multiple file formats',
              'Social media kit',
              'Business card design',
              'Source files included',
              '5 revisions'
            ]
          }
        },
        price: 150,
        deliveryTime: 3,
        revisions: 2,
        images: [
          'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'
        ],
        tags: ['logo', 'branding', 'design', 'professional', 'business'],
        searchTags: ['logo design', 'brand identity', 'graphic design', 'business logo'],
        requirements: [
          {
            question: 'What is your business name?',
            type: 'text',
            required: true
          },
          {
            question: 'What industry are you in?',
            type: 'text',
            required: true
          },
          {
            question: 'Do you have any color preferences?',
            type: 'text',
            required: false
          }
        ],
        totalOrders: 45,
        totalRating: 4.8 * 67,
        totalReviews: 67,
        isActive: true
      }
    ];

    for (const gigData of testGigs) {
      const existingGig = await Gig.findOne({ 
        userId: seller._id, 
        title: gigData.title 
      });
      
      if (!existingGig) {
        const gig = new Gig(gigData);
        await gig.save();
        console.log(`✅ Created gig: ${gigData.title}`);
      } else {
        console.log(`✅ Gig already exists: ${gigData.title}`);
      }
    }

    console.log('\n🎉 Payment test data seeding completed!');
    console.log('\n📋 Test Accounts:');
    console.log('Seller: seller@test.com / password123');
    console.log('Buyer: buyer@test.com / password123');
    console.log('\n💡 You can now test the payment flow by:');
    console.log('1. Login as buyer (buyer@test.com)');
    console.log('2. Browse gigs and select one created by sarah_dev');
    console.log('3. Click "Continue to Payment" to test Stripe checkout');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding payment test data:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedPaymentTestData();
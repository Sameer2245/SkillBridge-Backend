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
        languages: [{ language: 'English', level: 'Native' }, { language: 'Mandarin', level: 'Native' }],
        country: 'Canada',
        totalRating: 4.8,
        totalReviews: 203,
        completedOrders: 156
      },
      {
        username: 'maria_writer',
        email: 'maria@example.com',
        password: hashedPassword,
        fullName: 'Maria Rodriguez',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        description: 'Professional content writer and copywriter',
        skills: ['Content Writing', 'Copywriting', 'SEO Writing', 'Blog Writing'],
        languages: [{ language: 'English', level: 'Native' }, { language: 'Spanish', level: 'Native' }],
        country: 'Spain',
        totalRating: 4.7,
        totalReviews: 89,
        completedOrders: 72
      },
      {
        username: 'david_mobile',
        email: 'david@example.com',
        password: hashedPassword,
        fullName: 'David Kim',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        description: 'Mobile app developer and UI/UX designer',
        skills: ['React Native', 'Flutter', 'iOS', 'Android', 'UI/UX'],
        languages: [{ language: 'English', level: 'Fluent' }, { language: 'Korean', level: 'Native' }],
        country: 'South Korea',
        totalRating: 4.9,
        totalReviews: 156,
        completedOrders: 134
      },
      {
        username: 'emma_marketing',
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
      },
      {
        username: 'lisa_video',
        email: 'lisa@example.com',
        password: hashedPassword,
        fullName: 'Lisa Anderson',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        description: 'Video editor and motion graphics designer',
        skills: ['Video Editing', 'After Effects', 'Premiere Pro', 'Motion Graphics'],
        languages: [{ language: 'English', level: 'Native' }],
        country: 'United States',
        totalRating: 4.8,
        totalReviews: 78,
        completedOrders: 65
      },
      {
        username: 'carlos_seo',
        email: 'carlos@example.com',
        password: hashedPassword,
        fullName: 'Carlos Martinez',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        description: 'SEO specialist and digital marketing consultant',
        skills: ['SEO', 'Google Analytics', 'PPC', 'Digital Marketing'],
        languages: [{ language: 'English', level: 'Fluent' }, { language: 'Spanish', level: 'Native' }],
        country: 'Mexico',
        totalRating: 4.7,
        totalReviews: 112,
        completedOrders: 89
      },
      {
        username: 'anna_voice',
        email: 'anna@example.com',
        password: hashedPassword,
        fullName: 'Anna Petrov',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        description: 'Professional voice over artist and narrator',
        skills: ['Voice Over', 'Narration', 'Audio Editing', 'Commercial Voice'],
        languages: [{ language: 'English', level: 'Native' }, { language: 'Russian', level: 'Native' }],
        country: 'Russia',
        totalRating: 4.9,
        totalReviews: 234,
        completedOrders: 198
      },
      {
        username: 'mike_data',
        email: 'mike@example.com',
        password: hashedPassword,
        fullName: 'Mike Thompson',
        isSeller: true,
        profileImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
        description: 'Data scientist and machine learning engineer',
        skills: ['Python', 'Machine Learning', 'Data Analysis', 'AI'],
        languages: [{ language: 'English', level: 'Native' }],
        country: 'United States',
        totalRating: 4.8,
        totalReviews: 67,
        completedOrders: 54
      }
    ]);

    // Create comprehensive gigs array
    const gigs = [
      // Programming & Tech - Website Development
      {
        userId: users[0]._id,
        title: 'I will create a modern responsive website for your business',
        category: 'Programming & Tech',
        subcategory: 'Website Development',
        description: 'Professional web development with React, Node.js, and modern design principles. I will create a fully responsive website that works perfectly on all devices.',
        packages: {
          basic: { title: 'Basic Website', description: 'Simple responsive website with up to 5 pages', price: 299, deliveryTime: 7, revisions: 2, features: ['Responsive Design', 'Contact Form', 'SEO Optimized'] },
          standard: { title: 'Standard Website', description: 'Professional website with advanced features', price: 599, deliveryTime: 10, revisions: 3, features: ['Everything in Basic', 'CMS Integration', 'E-commerce Ready', 'Analytics Setup'] },
          premium: { title: 'Premium Website', description: 'Complete website solution with all features', price: 999, deliveryTime: 14, revisions: 5, features: ['Everything in Standard', 'Custom Animations', 'Performance Optimization', '1 Month Support'] }
        },
        price: 299, deliveryTime: 7, revisions: 2,
        images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'],
        tags: ['website', 'react', 'responsive', 'modern', 'business'],
        searchTags: ['website', 'react', 'responsive', 'modern', 'business', 'development'],
        totalOrders: 89, totalRating: 4.9, totalReviews: 127, isActive: true, isPaused: false
      },
      {
        userId: users[0]._id,
        title: 'I will build a full stack web application with MERN stack',
        category: 'Programming & Tech',
        subcategory: 'Website Development',
        description: 'Complete MERN stack application development with MongoDB, Express, React, and Node.js. Perfect for complex web applications.',
        packages: {
          basic: { title: 'Basic App', description: 'Simple web app with basic CRUD operations', price: 599, deliveryTime: 14, revisions: 2, features: ['MERN Stack', 'User Authentication', 'Database Design', 'API Development'] },
          standard: { title: 'Advanced App', description: 'Feature-rich web application', price: 1199, deliveryTime: 21, revisions: 3, features: ['Everything in Basic', 'Payment Integration', 'Real-time Features', 'Admin Panel'] },
          premium: { title: 'Enterprise App', description: 'Scalable enterprise solution', price: 2499, deliveryTime: 30, revisions: 5, features: ['Everything in Standard', 'Microservices', 'Cloud Deployment', '3 Months Support'] }
        },
        price: 599, deliveryTime: 14, revisions: 2,
        images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop'],
        tags: ['mern', 'fullstack', 'react', 'nodejs', 'mongodb'],
        searchTags: ['mern', 'fullstack', 'react', 'nodejs', 'mongodb', 'web', 'application'],
        totalOrders: 45, totalRating: 4.8, totalReviews: 67, isActive: true, isPaused: false
      },
      {
        userId: users[5]._id,
        title: 'I will develop a custom WordPress website',
        category: 'Programming & Tech',
        subcategory: 'WordPress',
        description: 'Professional WordPress development with custom themes and plugins. Get a powerful WordPress website tailored to your needs.',
        packages: {
          basic: { title: 'Basic WordPress Site', description: 'Custom WordPress website with basic features', price: 350, deliveryTime: 10, revisions: 2, features: ['Custom Theme', 'Responsive Design', 'Contact Form', 'SEO Setup'] },
          standard: { title: 'Advanced WordPress', description: 'WordPress site with advanced functionality', price: 650, deliveryTime: 14, revisions: 3, features: ['Everything in Basic', 'E-commerce', 'Custom Plugins', 'Performance Optimization'] },
          premium: { title: 'Enterprise WordPress', description: 'Complete WordPress solution with all features', price: 1200, deliveryTime: 21, revisions: 4, features: ['Everything in Standard', 'Multi-site Setup', 'Advanced Security', 'Maintenance Plan'] }
        },
        price: 350, deliveryTime: 10, revisions: 2,
        images: ['https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop'],
        tags: ['wordpress', 'cms', 'custom', 'development', 'php'],
        searchTags: ['wordpress', 'cms', 'custom', 'development', 'php', 'website'],
        totalOrders: 34, totalRating: 4.5, totalReviews: 45, isActive: true, isPaused: false
      },

      // Graphics & Design - Logo Design
      {
        userId: users[1]._id,
        title: 'I will design a professional logo for your brand',
        category: 'Graphics & Design',
        subcategory: 'Logo Design',
        description: 'Creative and memorable logo design that represents your brand perfectly. Get unlimited revisions until you are 100% satisfied.',
        packages: {
          basic: { title: 'Basic Logo', description: '3 logo concepts with 2 revisions', price: 49, deliveryTime: 3, revisions: 2, features: ['3 Logo Concepts', 'High Resolution Files', 'Transparent Background', 'Commercial License'] },
          standard: { title: 'Professional Logo', description: '5 concepts with brand guidelines', price: 99, deliveryTime: 5, revisions: 4, features: ['Everything in Basic', '5 Logo Concepts', 'Brand Guidelines', 'Social Media Kit'] },
          premium: { title: 'Complete Branding', description: 'Full brand identity package', price: 199, deliveryTime: 7, revisions: 6, features: ['Everything in Standard', 'Business Card Design', 'Letterhead Design', 'Brand Style Guide'] }
        },
        price: 49, deliveryTime: 3, revisions: 2,
        images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop'],
        tags: ['logo', 'branding', 'design', 'creative', 'professional'],
        searchTags: ['logo', 'branding', 'design', 'creative', 'professional', 'brand'],
        totalOrders: 156, totalRating: 4.8, totalReviews: 203, isActive: true, isPaused: false
      },
      {
        userId: users[1]._id,
        title: 'I will create stunning business card designs',
        category: 'Graphics & Design',
        subcategory: 'Business Cards & Stationery',
        description: 'Professional business card design that makes a lasting impression. Modern, creative, and print-ready designs.',
        packages: {
          basic: { title: 'Single Design', description: 'One business card design', price: 25, deliveryTime: 2, revisions: 2, features: ['1 Design Concept', 'Print Ready Files', 'High Resolution', 'Commercial License'] },
          standard: { title: 'Multiple Options', description: '3 different design concepts', price: 45, deliveryTime: 3, revisions: 3, features: ['Everything in Basic', '3 Design Concepts', 'Both Sides Design', 'Multiple Formats'] },
          premium: { title: 'Complete Package', description: 'Business cards + stationery', price: 89, deliveryTime: 5, revisions: 4, features: ['Everything in Standard', 'Letterhead Design', 'Envelope Design', 'Brand Guidelines'] }
        },
        price: 25, deliveryTime: 2, revisions: 2,
        images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'],
        tags: ['business card', 'stationery', 'print design', 'professional'],
        searchTags: ['business', 'card', 'stationery', 'print', 'design', 'professional'],
        totalOrders: 89, totalRating: 4.7, totalReviews: 112, isActive: true, isPaused: false
      },

      // Writing & Translation
      {
        userId: users[2]._id,
        title: 'I will write engaging blog posts and articles for your website',
        category: 'Writing & Translation',
        subcategory: 'Content Writing',
        description: 'High-quality, SEO-optimized content that engages your audience and drives traffic. Well-researched articles tailored to your niche.',
        packages: {
          basic: { title: '500 Words Article', description: 'Well-researched 500-word article', price: 15, deliveryTime: 2, revisions: 1, features: ['500 Words', 'SEO Optimized', 'Plagiarism Free', 'Fast Delivery'] },
          standard: { title: '1000 Words Article', description: 'In-depth 1000-word article', price: 25, deliveryTime: 3, revisions: 2, features: ['Everything in Basic', '1000 Words', 'Meta Description', 'Keywords Research'] },
          premium: { title: '1500+ Words Article', description: 'Comprehensive long-form content', price: 45, deliveryTime: 5, revisions: 3, features: ['Everything in Standard', '1500+ Words', 'Images Suggestions', 'Social Media Posts'] }
        },
        price: 15, deliveryTime: 2, revisions: 1,
        images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop'],
        tags: ['content writing', 'blog posts', 'articles', 'seo', 'copywriting'],
        searchTags: ['content', 'writing', 'blog', 'posts', 'articles', 'seo', 'copywriting'],
        totalOrders: 72, totalRating: 4.7, totalReviews: 89, isActive: true, isPaused: false
      },
      {
        userId: users[2]._id,
        title: 'I will write compelling sales copy that converts',
        category: 'Writing & Translation',
        subcategory: 'Sales Copy',
        description: 'Persuasive sales copy that turns visitors into customers. Proven copywriting techniques that boost conversions.',
        packages: {
          basic: { title: 'Sales Page Copy', description: 'Compelling sales page copy', price: 75, deliveryTime: 3, revisions: 2, features: ['Sales Page Copy', 'Headline Creation', 'Call-to-Action', 'Conversion Focused'] },
          standard: { title: 'Complete Sales Funnel', description: 'Full sales funnel copy', price: 149, deliveryTime: 5, revisions: 3, features: ['Everything in Basic', 'Email Sequence', 'Landing Page Copy', 'Thank You Page'] },
          premium: { title: 'Marketing Campaign', description: 'Complete marketing copy package', price: 299, deliveryTime: 7, revisions: 4, features: ['Everything in Standard', 'Ad Copy', 'Social Media Copy', 'Strategy Consultation'] }
        },
        price: 75, deliveryTime: 3, revisions: 2,
        images: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop'],
        tags: ['sales copy', 'copywriting', 'conversion', 'marketing', 'persuasive'],
        searchTags: ['sales', 'copy', 'copywriting', 'conversion', 'marketing', 'persuasive'],
        totalOrders: 43, totalRating: 4.8, totalReviews: 56, isActive: true, isPaused: false
      },

      // Digital Marketing
      {
        userId: users[4]._id,
        title: 'I will manage your social media accounts and grow your following',
        category: 'Digital Marketing',
        subcategory: 'Social Media Marketing',
        description: 'Complete social media management service. I will create engaging content, manage your accounts, and grow your audience organically.',
        packages: {
          basic: { title: 'Basic Management', description: '1 platform, 10 posts per month', price: 199, deliveryTime: 30, revisions: 2, features: ['1 Social Platform', '10 Posts/Month', 'Content Creation', 'Basic Analytics'] },
          standard: { title: 'Multi-Platform', description: '3 platforms, 30 posts per month', price: 399, deliveryTime: 30, revisions: 3, features: ['Everything in Basic', '3 Social Platforms', '30 Posts/Month', 'Hashtag Strategy'] },
          premium: { title: 'Complete Package', description: 'Full social media strategy', price: 799, deliveryTime: 30, revisions: 4, features: ['Everything in Standard', '5 Platforms', 'Paid Ads Management', 'Monthly Reports'] }
        },
        price: 199, deliveryTime: 30, revisions: 2,
        images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'],
        tags: ['social media', 'marketing', 'instagram', 'facebook', 'content'],
        searchTags: ['social', 'media', 'marketing', 'instagram', 'facebook', 'content', 'management'],
        totalOrders: 67, totalRating: 4.6, totalReviews: 92, isActive: true, isPaused: false
      },
      {
        userId: users[7]._id,
        title: 'I will boost your website SEO ranking to first page of Google',
        category: 'Digital Marketing',
        subcategory: 'SEO',
        description: 'Professional SEO service to improve your website ranking. White-hat techniques that deliver long-term results.',
        packages: {
          basic: { title: 'Basic SEO Audit', description: 'Complete SEO analysis and recommendations', price: 99, deliveryTime: 5, revisions: 1, features: ['SEO Audit Report', 'Keyword Research', 'On-Page Analysis', 'Recommendations'] },
          standard: { title: 'SEO Optimization', description: 'Full on-page SEO optimization', price: 299, deliveryTime: 14, revisions: 2, features: ['Everything in Basic', 'On-Page Optimization', 'Meta Tags Setup', 'Content Optimization'] },
          premium: { title: 'Complete SEO Package', description: 'Full SEO campaign with link building', price: 599, deliveryTime: 30, revisions: 3, features: ['Everything in Standard', 'Link Building', 'Monthly Reports', '3 Months Support'] }
        },
        price: 99, deliveryTime: 5, revisions: 1,
        images: ['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop'],
        tags: ['seo', 'google ranking', 'website optimization', 'digital marketing'],
        searchTags: ['seo', 'google', 'ranking', 'website', 'optimization', 'digital', 'marketing'],
        totalOrders: 89, totalRating: 4.7, totalReviews: 112, isActive: true, isPaused: false
      },

      // Video & Animation
      {
        userId: users[6]._id,
        title: 'I will edit your videos professionally with motion graphics',
        category: 'Video & Animation',
        subcategory: 'Video Editing',
        description: 'Professional video editing with motion graphics, color correction, and sound design. Make your videos stand out.',
        packages: {
          basic: { title: 'Basic Editing', description: 'Simple video editing up to 5 minutes', price: 89, deliveryTime: 3, revisions: 2, features: ['Video Editing', 'Color Correction', 'Audio Sync', 'Basic Transitions'] },
          standard: { title: 'Professional Edit', description: 'Advanced editing with motion graphics', price: 199, deliveryTime: 5, revisions: 3, features: ['Everything in Basic', 'Motion Graphics', 'Sound Design', 'Custom Animations'] },
          premium: { title: 'Cinematic Package', description: 'Hollywood-style video production', price: 399, deliveryTime: 7, revisions: 4, features: ['Everything in Standard', 'Advanced VFX', 'Professional Grading', 'Multiple Formats'] }
        },
        price: 89, deliveryTime: 3, revisions: 2,
        images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop'],
        tags: ['video editing', 'motion graphics', 'animation', 'post production'],
        searchTags: ['video', 'editing', 'motion', 'graphics', 'animation', 'post', 'production'],
        totalOrders: 65, totalRating: 4.8, totalReviews: 78, isActive: true, isPaused: false
      },
      {
        userId: users[6]._id,
        title: 'I will create animated explainer videos for your business',
        category: 'Video & Animation',
        subcategory: 'Animated Explainers',
        description: 'Engaging animated explainer videos that simplify complex concepts and boost conversions.',
        packages: {
          basic: { title: '30 Second Video', description: 'Short animated explainer video', price: 149, deliveryTime: 7, revisions: 2, features: ['30 Second Video', '2D Animation', 'Voiceover Included', 'Background Music'] },
          standard: { title: '60 Second Video', description: 'Detailed explainer video', price: 299, deliveryTime: 10, revisions: 3, features: ['Everything in Basic', '60 Second Video', 'Custom Characters', 'Script Writing'] },
          premium: { title: '90+ Second Video', description: 'Comprehensive animated video', price: 499, deliveryTime: 14, revisions: 4, features: ['Everything in Standard', '90+ Seconds', 'Premium Animation', 'Multiple Revisions'] }
        },
        price: 149, deliveryTime: 7, revisions: 2,
        images: ['https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=800&h=600&fit=crop'],
        tags: ['explainer video', 'animation', '2d animation', 'business video'],
        searchTags: ['explainer', 'video', 'animation', '2d', 'business', 'animated'],
        totalOrders: 34, totalRating: 4.9, totalReviews: 45, isActive: true, isPaused: false
      },

      // Music & Audio
      {
        userId: users[8]._id,
        title: 'I will record professional voiceover for your project',
        category: 'Music & Audio',
        subcategory: 'Voice Over',
        description: 'Professional voiceover recording with broadcast quality. Perfect for commercials, explainer videos, and audiobooks.',
        packages: {
          basic: { title: 'Basic Voiceover', description: 'Up to 100 words voiceover', price: 25, deliveryTime: 2, revisions: 1, features: ['Up to 100 Words', 'High Quality Audio', 'Commercial License', 'Fast Delivery'] },
          standard: { title: 'Extended Voiceover', description: 'Up to 300 words with editing', price: 65, deliveryTime: 3, revisions: 2, features: ['Everything in Basic', 'Up to 300 Words', 'Audio Editing', 'Background Music'] },
          premium: { title: 'Professional Package', description: 'Up to 500 words with full production', price: 125, deliveryTime: 5, revisions: 3, features: ['Everything in Standard', 'Up to 500 Words', 'Full Production', 'Multiple Takes'] }
        },
        price: 25, deliveryTime: 2, revisions: 1,
        images: ['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop'],
        tags: ['voiceover', 'voice acting', 'narration', 'audio recording'],
        searchTags: ['voiceover', 'voice', 'acting', 'narration', 'audio', 'recording'],
        totalOrders: 198, totalRating: 4.9, totalReviews: 234, isActive: true, isPaused: false
      },

      // Data & Analytics
      {
        userId: users[9]._id,
        title: 'I will analyze your data and create insightful reports',
        category: 'Data',
        subcategory: 'Data Analysis',
        description: 'Professional data analysis with Python and machine learning. Turn your data into actionable insights.',
        packages: {
          basic: { title: 'Basic Analysis', description: 'Simple data analysis and visualization', price: 99, deliveryTime: 5, revisions: 2, features: ['Data Cleaning', 'Basic Visualization', 'Summary Report', 'CSV/Excel Output'] },
          standard: { title: 'Advanced Analysis', description: 'Comprehensive data analysis', price: 249, deliveryTime: 7, revisions: 3, features: ['Everything in Basic', 'Statistical Analysis', 'Interactive Dashboard', 'Detailed Insights'] },
          premium: { title: 'ML & Predictions', description: 'Machine learning and predictive analysis', price: 499, deliveryTime: 14, revisions: 4, features: ['Everything in Standard', 'ML Models', 'Predictions', 'Custom Algorithm'] }
        },
        price: 99, deliveryTime: 5, revisions: 2,
        images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'],
        tags: ['data analysis', 'python', 'machine learning', 'statistics'],
        searchTags: ['data', 'analysis', 'python', 'machine', 'learning', 'statistics'],
        totalOrders: 54, totalRating: 4.8, totalReviews: 67, isActive: true, isPaused: false
      },

      // Mobile Apps
      {
        userId: users[3]._id,
        title: 'I will develop a cross-platform mobile app with React Native',
        category: 'Programming & Tech',
        subcategory: 'Mobile Apps',
        description: 'Professional mobile app development for iOS and Android using React Native. One codebase, two platforms.',
        packages: {
          basic: { title: 'Simple App', description: 'Basic mobile app with core features', price: 799, deliveryTime: 21, revisions: 2, features: ['React Native App', 'iOS & Android', 'Basic UI/UX', 'App Store Ready'] },
          standard: { title: 'Feature-Rich App', description: 'Advanced mobile app with integrations', price: 1499, deliveryTime: 30, revisions: 3, features: ['Everything in Basic', 'API Integration', 'Push Notifications', 'User Authentication'] },
          premium: { title: 'Enterprise App', description: 'Complete mobile solution', price: 2999, deliveryTime: 45, revisions: 5, features: ['Everything in Standard', 'Backend Development', 'Admin Panel', '3 Months Support'] }
        },
        price: 799, deliveryTime: 21, revisions: 2,
        images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop'],
        tags: ['mobile app', 'react native', 'ios', 'android', 'cross platform'],
        searchTags: ['mobile', 'app', 'react', 'native', 'ios', 'android', 'cross', 'platform'],
        totalOrders: 134, totalRating: 4.9, totalReviews: 156, isActive: true, isPaused: false
      },
      {
        userId: users[3]._id,
        title: 'I will design beautiful mobile app UI/UX',
        category: 'Graphics & Design',
        subcategory: 'Mobile App Design',
        description: 'Modern and intuitive mobile app design that provides excellent user experience. Figma designs ready for development.',
        packages: {
          basic: { title: 'App Screens', description: '5 mobile app screens design', price: 149, deliveryTime: 5, revisions: 2, features: ['5 App Screens', 'Mobile Optimized', 'Figma Files', 'Style Guide'] },
          standard: { title: 'Complete App Design', description: '15 screens with prototyping', price: 349, deliveryTime: 10, revisions: 3, features: ['Everything in Basic', '15 App Screens', 'Interactive Prototype', 'Icon Design'] },
          premium: { title: 'Full App Package', description: 'Complete app design with assets', price: 699, deliveryTime: 14, revisions: 4, features: ['Everything in Standard', '25+ Screens', 'App Icon', 'Developer Handoff'] }
        },
        price: 149, deliveryTime: 5, revisions: 2,
        images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop'],
        tags: ['mobile design', 'ui ux', 'app design', 'figma', 'user interface'],
        searchTags: ['mobile', 'design', 'ui', 'ux', 'app', 'figma', 'user', 'interface'],
        totalOrders: 78, totalRating: 4.8, totalReviews: 95, isActive: true, isPaused: false
      }
    ];

    await Gig.insertMany(gigs);

    console.log('Comprehensive sample data seeded successfully!');
    console.log(`Created ${users.length} users and ${gigs.length} gigs`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  seedData();
});
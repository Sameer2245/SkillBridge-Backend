const mongoose = require('mongoose');
require('dotenv').config();

const Gig = require('../models/Gig');
const User = require('../models/User');

const sampleGigs = [
  // Video & Animation Gigs
  {
    title: "I will create professional video editing and motion graphics",
    category: "Video & Animation",
    subcategory: "Video Editing",
    description: "Professional video editing services with motion graphics, color correction, and sound design. I specialize in creating engaging content for social media, YouTube, and corporate presentations. With over 5 years of experience using Adobe Premiere Pro, After Effects, and DaVinci Resolve, I'll transform your raw footage into polished, professional videos that captivate your audience.",
    packages: {
      basic: {
        title: "Basic Video Edit",
        description: "Simple video editing with cuts, transitions, and basic color correction",
        price: 50,
        deliveryTime: 3,
        revisions: 2,
        features: ["Video editing", "Basic transitions", "Color correction", "Audio sync"]
      },
      standard: {
        title: "Standard Video Edit",
        description: "Advanced editing with motion graphics, titles, and sound design",
        price: 100,
        deliveryTime: 5,
        revisions: 3,
        features: ["Everything in Basic", "Motion graphics", "Custom titles", "Sound design", "Advanced transitions"]
      },
      premium: {
        title: "Premium Video Production",
        description: "Complete video production with advanced effects and animations",
        price: 200,
        deliveryTime: 7,
        revisions: 5,
        features: ["Everything in Standard", "Advanced VFX", "3D animations", "Professional color grading", "Multiple formats"]
      }
    },
    price: 50,
    deliveryTime: 3,
    revisions: 2,
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
    ],
    tags: ["video editing", "motion graphics", "after effects", "premiere pro", "youtube"],
    searchTags: ["video", "editing", "motion", "graphics", "animation", "youtube", "social media"],
    totalOrders: 89,
    totalRating: 4.9,
    totalReviews: 67,
    isActive: true,
    isPaused: false
  },
  {
    title: "I will create stunning 2D animation videos for your brand",
    category: "Video & Animation",
    subcategory: "Animation",
    description: "Custom 2D animation services for explainer videos, promotional content, and brand storytelling. I create engaging animated videos that help businesses communicate their message effectively. Using industry-standard tools like Adobe After Effects and Animate, I deliver high-quality animations that capture attention and drive results.",
    packages: {
      basic: {
        title: "Simple 2D Animation",
        description: "30-second 2D animation with basic characters and scenes",
        price: 75,
        deliveryTime: 5,
        revisions: 2,
        features: ["30-second animation", "Basic characters", "Simple scenes", "Background music"]
      },
      standard: {
        title: "Professional Animation",
        description: "60-second animation with custom characters and detailed scenes",
        price: 150,
        deliveryTime: 7,
        revisions: 3,
        features: ["60-second animation", "Custom characters", "Detailed scenes", "Voiceover sync", "Sound effects"]
      },
      premium: {
        title: "Premium Animation Package",
        description: "90-second animation with advanced effects and multiple revisions",
        price: 300,
        deliveryTime: 10,
        revisions: 5,
        features: ["90-second animation", "Advanced effects", "Multiple scenes", "Professional voiceover", "Full commercial rights"]
      }
    },
    price: 75,
    deliveryTime: 5,
    revisions: 2,
    images: [
      "https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop"
    ],
    tags: ["2d animation", "explainer video", "brand animation", "after effects", "character animation"],
    searchTags: ["animation", "2d", "explainer", "brand", "video", "character", "motion"],
    totalOrders: 156,
    totalRating: 4.8,
    totalReviews: 123,
    isActive: true,
    isPaused: false
  },
  {
    title: "I will edit your YouTube videos with engaging thumbnails",
    category: "Video & Animation",
    subcategory: "Video Editing",
    description: "Specialized YouTube video editing services to help your channel grow. I understand what makes YouTube content engaging and will edit your videos to maximize viewer retention. Includes custom thumbnails, intro/outro animations, and optimization for YouTube's algorithm.",
    packages: {
      basic: {
        title: "YouTube Video Edit",
        description: "Basic YouTube video editing with thumbnail",
        price: 35,
        deliveryTime: 2,
        revisions: 2,
        features: ["Video editing", "Custom thumbnail", "Basic transitions", "Audio enhancement"]
      },
      standard: {
        title: "YouTube Pro Edit",
        description: "Advanced editing with animations and multiple thumbnails",
        price: 70,
        deliveryTime: 3,
        revisions: 3,
        features: ["Everything in Basic", "Intro/outro animation", "3 thumbnail options", "Advanced transitions", "SEO optimization"]
      },
      premium: {
        title: "YouTube Growth Package",
        description: "Complete YouTube optimization with analytics insights",
        price: 120,
        deliveryTime: 4,
        revisions: 4,
        features: ["Everything in Standard", "5 thumbnail options", "End screen optimization", "Analytics insights", "Growth strategy tips"]
      }
    },
    price: 35,
    deliveryTime: 2,
    revisions: 2,
    images: [
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop"
    ],
    tags: ["youtube editing", "thumbnail design", "video editing", "youtube optimization", "content creation"],
    searchTags: ["youtube", "video", "editing", "thumbnail", "content", "creator", "optimization"],
    totalOrders: 234,
    totalRating: 4.7,
    totalReviews: 189,
    isActive: true,
    isPaused: false
  },

  // Music & Audio Gigs
  {
    title: "I will produce professional music tracks and beats",
    category: "Music & Audio",
    subcategory: "Music Production",
    description: "Professional music production services for artists, content creators, and businesses. I specialize in creating original beats, mixing and mastering tracks, and producing high-quality music across various genres including hip-hop, pop, electronic, and cinematic. With state-of-the-art equipment and years of experience, I'll bring your musical vision to life.",
    packages: {
      basic: {
        title: "Beat Production",
        description: "Custom beat production in your preferred genre",
        price: 60,
        deliveryTime: 3,
        revisions: 2,
        features: ["Custom beat", "High-quality audio", "Commercial rights", "Stems included"]
      },
      standard: {
        title: "Full Track Production",
        description: "Complete track production with mixing and mastering",
        price: 150,
        deliveryTime: 7,
        revisions: 3,
        features: ["Everything in Basic", "Full track arrangement", "Professional mixing", "Mastering", "Multiple formats"]
      },
      premium: {
        title: "Album Production",
        description: "Complete album production with multiple tracks",
        price: 500,
        deliveryTime: 14,
        revisions: 5,
        features: ["Everything in Standard", "5 full tracks", "Album artwork consultation", "Distribution advice", "Unlimited revisions"]
      }
    },
    price: 60,
    deliveryTime: 3,
    revisions: 2,
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop"
    ],
    tags: ["music production", "beat making", "mixing", "mastering", "hip hop", "pop music"],
    searchTags: ["music", "production", "beats", "mixing", "mastering", "audio", "recording"],
    totalOrders: 178,
    totalRating: 4.9,
    totalReviews: 145,
    isActive: true,
    isPaused: false
  },
  {
    title: "I will create professional voiceovers for your projects",
    category: "Music & Audio",
    subcategory: "Voice Over",
    description: "Professional voiceover services for commercials, explainer videos, audiobooks, and more. With a professional home studio setup and years of experience, I deliver clear, engaging voiceovers that connect with your audience. Available in multiple languages and styles to match your project's needs.",
    packages: {
      basic: {
        title: "Basic Voiceover",
        description: "Up to 150 words professional voiceover",
        price: 25,
        deliveryTime: 2,
        revisions: 2,
        features: ["Up to 150 words", "High-quality audio", "Commercial rights", "Fast delivery"]
      },
      standard: {
        title: "Extended Voiceover",
        description: "Up to 500 words with background music",
        price: 75,
        deliveryTime: 3,
        revisions: 3,
        features: ["Up to 500 words", "Background music", "Audio editing", "Multiple takes", "Sync timing"]
      },
      premium: {
        title: "Professional Package",
        description: "Up to 1000 words with full production",
        price: 150,
        deliveryTime: 5,
        revisions: 5,
        features: ["Up to 1000 words", "Full audio production", "Multiple voice styles", "Rush delivery option", "Source files included"]
      }
    },
    price: 25,
    deliveryTime: 2,
    revisions: 2,
    images: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop"
    ],
    tags: ["voiceover", "voice acting", "narration", "commercial voice", "audiobook", "explainer video"],
    searchTags: ["voice", "voiceover", "narration", "audio", "recording", "commercial", "explainer"],
    totalOrders: 267,
    totalRating: 4.8,
    totalReviews: 198,
    isActive: true,
    isPaused: false
  },
  {
    title: "I will mix and master your songs professionally",
    category: "Music & Audio",
    subcategory: "Mixing & Mastering",
    description: "Professional mixing and mastering services to make your music sound radio-ready. Using industry-standard plugins and techniques, I'll enhance your tracks with proper EQ, compression, and effects. Your music will sound polished and competitive across all playback systems and streaming platforms.",
    packages: {
      basic: {
        title: "Mixing Only",
        description: "Professional mixing of your track",
        price: 80,
        deliveryTime: 4,
        revisions: 3,
        features: ["Professional mixing", "EQ and compression", "Effects processing", "Stereo mix delivery"]
      },
      standard: {
        title: "Mix + Master",
        description: "Complete mixing and mastering service",
        price: 120,
        deliveryTime: 5,
        revisions: 3,
        features: ["Everything in Basic", "Professional mastering", "Loudness optimization", "Multiple format delivery", "Reference track matching"]
      },
      premium: {
        title: "Deluxe Package",
        description: "Premium mixing and mastering with stems",
        price: 200,
        deliveryTime: 7,
        revisions: 5,
        features: ["Everything in Standard", "Stem mastering", "Vinyl mastering", "Streaming optimization", "Detailed feedback", "Unlimited revisions"]
      }
    },
    price: 80,
    deliveryTime: 4,
    revisions: 3,
    images: [
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
    ],
    tags: ["mixing", "mastering", "audio engineering", "music production", "sound design", "audio post"],
    searchTags: ["mixing", "mastering", "audio", "engineering", "music", "production", "sound"],
    totalOrders: 145,
    totalRating: 4.9,
    totalReviews: 112,
    isActive: true,
    isPaused: false
  }
];

async function addSampleGigs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a user to assign these gigs to (or create a sample user)
    let sampleUser = await User.findOne({ email: 'sample@example.com' });
    
    if (!sampleUser) {
      // Create a sample user if none exists
      sampleUser = new User({
        username: 'samplecreator',
        email: 'sample@example.com',
        fullName: 'Sample Creator',
        password: 'hashedpassword', // In real app, this would be properly hashed
        isEmailVerified: true,
        profileImage: 'https://ui-avatars.com/api/?name=Sample+Creator&background=EF4444&color=fff',
        country: 'United States',
        totalRating: 4.8,
        totalReviews: 156
      });
      await sampleUser.save();
      console.log('Created sample user');
    }

    // Add userId to each gig
    const gigsWithUser = sampleGigs.map(gig => ({
      ...gig,
      userId: sampleUser._id
    }));

    // Insert the gigs
    const result = await Gig.insertMany(gigsWithUser);
    console.log(`Successfully added ${result.length} sample gigs`);

    // Verify the categories now exist
    const categories = await Gig.distinct('category');
    console.log('Available categories after adding gigs:');
    categories.forEach(cat => console.log('- ' + cat));

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample gigs:', error);
    process.exit(1);
  }
}

addSampleGigs();
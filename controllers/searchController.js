const Gig = require('../models/Gig');
const User = require('../models/User');

// Search gigs with advanced filtering and fuzzy matching
const searchGigs = async (req, res) => {
  try {
    const {
      query = '',
      q = '', // Alternative query parameter
      category,
      subcategory,
      minPrice,
      maxPrice,
      deliveryTime,
      rating,
      page = 1,
      limit = 20,
      sortBy = 'relevance',
      sortOrder = 'desc',
      pro = false, // Filter for pro sellers
      online = false // Filter for online sellers
    } = req.query;

    const searchTerm = query || q || '';
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Build base filter
    const filter = {
      isActive: true,
      $or: [
        { isPaused: { $exists: false } },
        { isPaused: false }
      ]
    };

    // Category filters
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    // Price filters
    if (minPrice || maxPrice) {
      filter['packages.basic.price'] = {};
      if (minPrice) filter['packages.basic.price'].$gte = Number(minPrice);
      if (maxPrice) filter['packages.basic.price'].$lte = Number(maxPrice);
    }

    // Delivery time filter
    if (deliveryTime) {
      filter['packages.basic.deliveryTime'] = { $lte: Number(deliveryTime) };
    }

    // Rating filter
    if (rating) {
      filter.totalRating = { $gte: Number(rating) };
    }

    let aggregationPipeline = [];

    // Text search stage
    if (searchTerm.trim()) {
      aggregationPipeline.push({
        $match: {
          ...filter,
          $or: [
            { $text: { $search: searchTerm } },
            { title: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } },
            { subcategory: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } },
            { searchTags: { $in: [new RegExp(searchTerm, 'i')] } }
          ]
        }
      });

      // Add text score for relevance sorting
      aggregationPipeline.push({
        $addFields: {
          score: {
            $meta: 'textScore'
          },
          relevanceScore: {
            $add: [
              { $cond: [{ $regexMatch: { input: '$title', regex: searchTerm, options: 'i' } }, 10, 0] },
              { $cond: [{ $in: [searchTerm.toLowerCase(), '$tags'] }, 8, 0] },
              { $cond: [{ $regexMatch: { input: '$category', regex: searchTerm, options: 'i' } }, 5, 0] },
              { $cond: [{ $regexMatch: { input: '$description', regex: searchTerm, options: 'i' } }, 3, 0] }
            ]
          }
        }
      });
    } else {
      aggregationPipeline.push({ $match: filter });
      aggregationPipeline.push({
        $addFields: {
          score: 0,
          relevanceScore: 0
        }
      });
    }

    // Populate user data
    aggregationPipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    });

    aggregationPipeline.push({
      $unwind: '$user'
    });

    // Filter by seller criteria
    if (pro) {
      aggregationPipeline.push({
        $match: {
          'user.isPro': true
        }
      });
    }

    if (online) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      aggregationPipeline.push({
        $match: {
          'user.lastSeen': { $gte: fiveMinutesAgo }
        }
      });
    }

    // Sorting
    let sortStage = {};
    switch (sortBy) {
      case 'price_low':
        sortStage = { 'packages.basic.price': 1 };
        break;
      case 'price_high':
        sortStage = { 'packages.basic.price': -1 };
        break;
      case 'rating':
        sortStage = { totalRating: -1, totalReviews: -1 };
        break;
      case 'popularity':
        sortStage = { totalOrders: -1 };
        break;
      case 'newest':
        sortStage = { createdAt: -1 };
        break;
      case 'relevance':
      default:
        if (searchTerm.trim()) {
          sortStage = { relevanceScore: -1, score: { $meta: 'textScore' }, totalRating: -1 };
        } else {
          sortStage = { totalRating: -1, totalOrders: -1, createdAt: -1 };
        }
        break;
    }

    aggregationPipeline.push({ $sort: sortStage });

    // Pagination
    aggregationPipeline.push({ $skip: (pageNum - 1) * limitNum });
    aggregationPipeline.push({ $limit: limitNum });

    // Project final fields
    aggregationPipeline.push({
      $project: {
        _id: 1,
        title: 1,
        category: 1,
        subcategory: 1,
        description: 1,
        packages: 1,
        price: 1,
        deliveryTime: 1,
        revisions: 1,
        images: 1,
        tags: 1,
        totalOrders: 1,
        totalRating: 1,
        totalReviews: 1,
        createdAt: 1,
        userId: {
          _id: '$user._id',
          username: '$user.username',
          profileImage: '$user.profileImage',
          totalRating: '$user.totalRating',
          totalReviews: '$user.totalReviews',
          country: '$user.country',
          isPro: '$user.isPro',
          isOnline: {
            $gte: ['$user.lastSeen', new Date(Date.now() - 5 * 60 * 1000)]
          }
        },
        score: 1,
        relevanceScore: 1
      }
    });

    const gigs = await Gig.aggregate(aggregationPipeline);

    // Get total count for pagination
    const countPipeline = [...aggregationPipeline.slice(0, -3)]; // Remove skip, limit, and project
    countPipeline.push({ $count: 'total' });
    const totalResult = await Gig.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.json({
      gigs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalGigs: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      filters: {
        query: searchTerm,
        category,
        subcategory,
        minPrice,
        maxPrice,
        deliveryTime,
        rating,
        sortBy,
        pro,
        online
      }
    });

  } catch (error) {
    console.error('Search gigs error:', error);
    res.status(500).json({ error: 'Failed to search gigs' });
  }
};

// Get search suggestions for autocomplete
const getSearchSuggestions = async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    
    if (!q.trim()) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Gig.aggregate([
      {
        $match: {
          isActive: true,
          isPaused: { $ne: true },
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } },
            { category: { $regex: q, $options: 'i' } },
            { subcategory: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          suggestions: {
            $concatArrays: [
              [{ $cond: [{ $regexMatch: { input: '$title', regex: q, options: 'i' } }, '$title', null] }],
              {
                $filter: {
                  input: '$tags',
                  cond: { $regexMatch: { input: '$$this', regex: q, options: 'i' } }
                }
              },
              [{ $cond: [{ $regexMatch: { input: '$category', regex: q, options: 'i' } }, '$category', null] }],
              [{ $cond: [{ $regexMatch: { input: '$subcategory', regex: q, options: 'i' } }, '$subcategory', null] }]
            ]
          }
        }
      },
      { $unwind: '$suggestions' },
      { $match: { suggestions: { $ne: null } } },
      {
        $group: {
          _id: '$suggestions',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          text: '$_id',
          count: 1
        }
      }
    ]);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
};

// Get available filters for search
const getSearchFilters = async (req, res) => {
  try {
    const categories = await Gig.distinct('category', { isActive: true });
    const subcategories = await Gig.distinct('subcategory', { isActive: true });
    
    // Get price ranges
    const priceStats = await Gig.aggregate([
      { $match: { isActive: true, isPaused: { $ne: true } } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$packages.basic.price' },
          maxPrice: { $max: '$packages.basic.price' },
          avgPrice: { $avg: '$packages.basic.price' }
        }
      }
    ]);

    // Get delivery time options
    const deliveryTimes = await Gig.distinct('packages.basic.deliveryTime', { isActive: true });
    
    res.json({
      categories: categories.sort(),
      subcategories: subcategories.sort(),
      priceRange: priceStats[0] || { minPrice: 0, maxPrice: 1000, avgPrice: 100 },
      deliveryTimes: deliveryTimes.sort((a, b) => a - b),
      sortOptions: [
        { value: 'relevance', label: 'Most Relevant' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'popularity', label: 'Most Popular' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Newest First' }
      ],
      ratingOptions: [5, 4, 3, 2, 1]
    });
  } catch (error) {
    console.error('Get search filters error:', error);
    res.status(500).json({ error: 'Failed to get search filters' });
  }
};

module.exports = {
  searchGigs,
  getSearchSuggestions,
  getSearchFilters
};


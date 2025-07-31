const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'uploadedResources',
        select: 'title type category subject createdAt votes.score views downloads',
        options: { sort: { createdAt: -1 }, limit: 10 }
      })
      .select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const stats = {
      totalUploads: user.uploadedResources.length,
      totalReputation: user.reputation,
      totalViews: 0,
      totalDownloads: 0
    };

    // Calculate total views and downloads for user's resources
    const userResources = await Resource.find({ author: user._id });
    stats.totalViews = userResources.reduce((sum, resource) => sum + resource.views, 0);
    stats.totalDownloads = userResources.reduce((sum, resource) => sum + resource.downloads, 0);

    res.json({
      success: true,
      user: user.toJSON(),
      stats
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

// Get current user's bookmarked resources
router.get('/me/bookmarks', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.userId)
      .populate({
        path: 'bookmarkedResources',
        populate: {
          path: 'author',
          select: 'username firstName lastName college stream'
        },
        options: {
          skip,
          limit,
          sort: { createdAt: -1 }
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const total = user.bookmarkedResources.length;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      bookmarks: user.bookmarkedResources,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Get user bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookmarks'
    });
  }
});

// Get user's bookmarked resources
router.get('/:id/bookmarks', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id)
      .populate({
        path: 'bookmarkedResources',
        populate: {
          path: 'author',
          select: 'username firstName lastName college stream'
        },
        options: {
          sort: { createdAt: -1 },
          skip,
          limit
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const total = user.bookmarkedResources.length;

    res.json({
      success: true,
      bookmarks: user.bookmarkedResources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookmarks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookmarks'
    });
  }
});

// Get user's uploaded resources
router.get('/:id/uploads', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resources = await Resource.find({ author: req.params.id })
      .populate('author', 'username firstName lastName college stream')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments({ author: req.params.id });

    res.json({
      success: true,
      uploads: resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUploads: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching uploads'
    });
  }
});

// Search users
router.get('/', [
  query('search').optional().isString(),
  query('college').optional().isString(),
  query('stream').optional().isString(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.college) {
      filter.college = { $regex: req.query.college, $options: 'i' };
    }
    
    if (req.query.stream) {
      filter.stream = req.query.stream;
    }
    
    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { college: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password -email -votedResources')
      .populate({
        path: 'uploadedResources',
        select: 'title type votes.score',
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .sort({ reputation: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
});

// Get leaderboard
router.get('/leaderboard/top', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topUsers = await User.find()
      .select('-password -email -votedResources -bookmarkedResources')
      .sort({ reputation: -1, createdAt: 1 })
      .limit(limit);

    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
      ...user.toJSON(),
      rank: index + 1
    }));

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard'
    });
  }
});

// Get dashboard data for authenticated user
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('uploadedResources', 'views downloads votes.score')
      .populate('bookmarkedResources', 'title type createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate stats
    const stats = {
      totalUploads: user.uploadedResources.length,
      totalBookmarks: user.bookmarkedResources.length,
      totalViews: user.uploadedResources.reduce((sum, resource) => sum + resource.views, 0),
      totalDownloads: user.uploadedResources.reduce((sum, resource) => sum + resource.downloads, 0),
      totalUpvotes: user.uploadedResources.reduce((sum, resource) => sum + resource.votes.upvotes, 0),
      reputation: user.reputation
    };

    // Get recent activity
    const recentUploads = user.uploadedResources
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentBookmarks = user.bookmarkedResources
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      stats,
      recentActivity: {
        uploads: recentUploads,
        bookmarks: recentBookmarks
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
});

module.exports = router;

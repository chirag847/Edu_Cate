const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult, query } = require('express-validator');
const Resource = require('../models/Resource');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { storage } = require('../config/cloudinary');

const router = express.Router();

// Multer configuration for Cloudinary file uploads
const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-rar-compressed'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR and image files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all resources with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString(),
  query('type').optional().isString(),
  query('semester').optional().isString(),
  query('difficulty').optional().isString(),
  query('author').optional().isMongoId().withMessage('Author must be a valid user ID'),
  query('sortBy').optional().isIn(['createdAt', 'votes.score', 'views', 'downloads']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('search').optional().isString()
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

    // Build filter object
    const filter = { status: 'approved' };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.author) filter.author = req.query.author;
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const resources = await Resource.find(filter)
      .populate('author', 'username firstName lastName college stream')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Resource.countDocuments(filter);

    res.json({
      success: true,
      resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResources: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resources'
    });
  }
});

// Get single resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('author', 'username firstName lastName college stream profilePicture')
      .populate('comments.user', 'username firstName lastName profilePicture');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json({
      success: true,
      resource
    });

  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resource'
    });
  }
});

// Create new resource
router.post('/', auth, (req, res, next) => {
  console.log('=== Multer Upload Starting ===');
  upload.array('files', 5)(req, res, (err) => {
    console.log('=== Multer Upload Completed ===');
    if (err) {
      console.error('Multer error:', err);
      
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 5 files allowed.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field name for file upload.'
          });
        }
      }
      
      // Custom file filter error
      if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'File upload error'
      });
    }
    next();
  });
}, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('type')
    .isIn(['notes', 'book', 'blog', 'recommendation', 'project', 'assignment', 'research_paper'])
    .withMessage('Invalid resource type'),
  body('category')
    .isIn([
      'Computer Science',
      'Information Technology',
      'Electronics & Communication',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Aerospace Engineering',
      'Biomedical Engineering',
      'Industrial Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'General Engineering',
      'Other'
    ])
    .withMessage('Invalid category'),
  body('subject')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Subject is required'),
  body('semester')
    .isIn(['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'All Semesters'])
    .withMessage('Invalid semester'),
  body('difficulty')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid difficulty level'),
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch (e) {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Tags must be a valid JSON array'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('externalLinks')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch (e) {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('External links must be a valid JSON array')
], async (req, res) => {
  try {
    console.log('=== Resource Upload Debug ===');
    console.log('Request body:', Object.keys(req.body));
    console.log('Files:', req.files ? req.files.length : 0);
    console.log('User:', req.user ? req.user.userId : 'NO USER');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      type,
      category,
      subject,
      semester,
      difficulty,
      content
    } = req.body;

    // Parse JSON fields that come from FormData
    let tags = [];
    let externalLinks = [];
    
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = [];
      }
    }
    
    if (req.body.externalLinks) {
      try {
        externalLinks = JSON.parse(req.body.externalLinks);
      } catch (e) {
        externalLinks = [];
      }
    }

    // Process uploaded files from Cloudinary
    console.log('Processing uploaded files...');
    console.log('req.files:', req.files);
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public_id
      size: file.size,
      mimeType: file.mimetype
    })) : [];
    console.log('Processed files:', files.length);

    // Create new resource
    const resource = new Resource({
      title,
      description,
      type,
      category,
      subject,
      semester,
      difficulty: difficulty || 'Intermediate',
      tags: tags || [],
      content: content || '',
      externalLinks: externalLinks || [],
      author: req.user.userId,
      files,
      status: 'approved' // For now, auto-approve. In production, you might want moderation
    });

    console.log('About to save resource:', resource.title);
    await resource.save();
    console.log('Resource saved successfully');

    // Add to user's uploaded resources
    console.log('Adding resource to user uploadedResources');
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { uploadedResources: resource._id }
    });
    console.log('User updated successfully');

    // Populate author info
    console.log('Populating author info');
    await resource.populate('author', 'username firstName lastName college stream');
    console.log('Author populated successfully');

    console.log('Sending response...');
    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      resource
    });
    console.log('Response sent successfully');

  } catch (error) {
    console.error('=== Resource Upload Error ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body keys:', Object.keys(req.body || {}));
    console.error('Files count:', req.files ? req.files.length : 0);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Resource with this title already exists'
      });
    }

    // Handle Cloudinary/Multer errors
    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Vote on resource
router.post('/:id/vote', auth, [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be either upvote or downvote')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { voteType } = req.body;
    const resourceId = req.params.id;
    const userId = req.user.userId;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user already voted
    const existingVote = resource.voters.find(voter => voter.user.equals(userId));
    
    let message;
    if (existingVote && existingVote.voteType === voteType) {
      // Remove vote if same vote type
      await resource.removeVote(userId);
      message = 'Vote removed';
    } else {
      // Add or change vote
      await resource.addVote(userId, voteType);
      message = `${voteType} added`;
    }

    // Update user's voted resources
    const user = await User.findById(userId);
    user.votedResources = user.votedResources.filter(v => !v.resource.equals(resourceId));
    
    if (resource.voters.find(voter => voter.user.equals(userId))) {
      user.votedResources.push({
        resource: resourceId,
        voteType: resource.voters.find(voter => voter.user.equals(userId)).voteType
      });
    }
    
    await user.save();

    res.json({
      success: true,
      message,
      votes: resource.votes
    });

  } catch (error) {
    console.error('Vote resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while voting'
    });
  }
});

// Bookmark/unbookmark resource
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.userId;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedResources.includes(resourceId);

    let message;
    if (isBookmarked) {
      // Remove bookmark
      user.bookmarkedResources = user.bookmarkedResources.filter(id => !id.equals(resourceId));
      resource.bookmarkedBy = resource.bookmarkedBy.filter(id => !id.equals(userId));
      resource.bookmarks = Math.max(0, resource.bookmarks - 1);
      message = 'Bookmark removed';
    } else {
      // Add bookmark
      user.bookmarkedResources.push(resourceId);
      resource.bookmarkedBy.push(userId);
      resource.bookmarks += 1;
      message = 'Resource bookmarked';
    }

    await Promise.all([user.save(), resource.save()]);

    res.json({
      success: true,
      message,
      isBookmarked: !isBookmarked
    });

  } catch (error) {
    console.error('Bookmark resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while bookmarking'
    });
  }
});

// Add comment to resource
router.post('/:id/comments', auth, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content } = req.body;
    const resourceId = req.params.id;
    const userId = req.user.userId;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    resource.comments.push({
      user: userId,
      content
    });

    await resource.save();
    
    // Populate the new comment
    await resource.populate('comments.user', 'username firstName lastName profilePicture');

    const newComment = resource.comments[resource.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
});

// Download file
router.get('/:id/download/:fileIndex', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const fileIndex = parseInt(req.params.fileIndex);
    if (isNaN(fileIndex) || fileIndex < 0 || fileIndex >= resource.files.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file index'
      });
    }

    const file = resource.files[fileIndex];
    
    // Increment download count
    resource.downloads += 1;
    await resource.save();

    // For Cloudinary files, redirect to the URL or return the URL
    if (file.url) {
      // Return Cloudinary URL for download
      res.json({
        success: true,
        downloadUrl: file.url,
        filename: file.originalName,
        mimeType: file.mimeType
      });
    } else if (file.path) {
      // Fallback for legacy local files
      const filePath = path.join(__dirname, '..', file.path);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);

      // Send file
      res.sendFile(filePath);
    } else {
      return res.status(404).json({
        success: false,
        message: 'File URL not available'
      });
    }

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading file'
    });
  }
});

// Get user's resources
router.get('/user/my-resources', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resources = await Resource.find({ author: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName');

    const total = await Resource.countDocuments({ author: req.user.userId });

    res.json({
      success: true,
      resources,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResources: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get user resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user resources'
    });
  }
});

// Delete resource
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is the author or admin
    if (resource.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }

    // Delete files from Cloudinary
    const { cloudinary } = require('../config/cloudinary');
    for (const file of resource.files) {
      if (file.publicId) {
        try {
          await cloudinary.uploader.destroy(file.publicId);
        } catch (error) {
          console.error('Error deleting file from Cloudinary:', error);
        }
      }
    }

    // Remove resource from database
    await Resource.findByIdAndDelete(req.params.id);

    // Remove from user's uploaded resources
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { uploadedResources: req.params.id }
    });

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting resource'
    });
  }
});

// Test file upload endpoint
router.post('/test-upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// Get comments for a resource
router.get('/:id/comments', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('comments.user', 'username firstName lastName profilePicture')
      .select('comments');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      comments: resource.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments'
    });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['notes', 'book', 'blog', 'recommendation', 'project', 'assignment', 'research_paper']
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    enum: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'All Semesters'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    filename: String,
    originalName: String,
    path: String, // Keep for backward compatibility
    url: String, // Cloudinary URL
    publicId: String, // Cloudinary public_id for management
    size: Number,
    mimeType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  externalLinks: [{
    title: String,
    url: String,
    description: String
  }],
  content: {
    type: String, // For blog posts or text-based recommendations
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  votes: {
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0
    }
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote']
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  bookmarks: {
    type: Number,
    default: 0
  },
  bookmarkedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
resourceSchema.index({ category: 1, type: 1 });
resourceSchema.index({ semester: 1, subject: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ 'votes.score': -1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ author: 1 });

// Calculate score when votes change
resourceSchema.methods.updateScore = function() {
  this.votes.score = this.votes.upvotes - this.votes.downvotes;
  return this.save();
};

// Add vote method
resourceSchema.methods.addVote = function(userId, voteType) {
  // Remove existing vote from same user
  this.voters = this.voters.filter(voter => !voter.user.equals(userId));
  
  if (voteType === 'upvote') {
    this.votes.upvotes += 1;
    this.voters.push({ user: userId, voteType: 'upvote' });
  } else if (voteType === 'downvote') {
    this.votes.downvotes += 1;
    this.voters.push({ user: userId, voteType: 'downvote' });
  }
  
  this.updateScore();
  return this.save();
};

// Remove vote method
resourceSchema.methods.removeVote = function(userId) {
  const existingVote = this.voters.find(voter => voter.user.equals(userId));
  
  if (existingVote) {
    if (existingVote.voteType === 'upvote') {
      this.votes.upvotes = Math.max(0, this.votes.upvotes - 1);
    } else {
      this.votes.downvotes = Math.max(0, this.votes.downvotes - 1);
    }
    
    this.voters = this.voters.filter(voter => !voter.user.equals(userId));
    this.updateScore();
  }
  
  return this.save();
};

module.exports = mongoose.model('Resource', resourceSchema);

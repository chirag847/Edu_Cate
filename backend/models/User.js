const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  stream: {
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
      'Other'
    ]
  },
  year: {
    type: String,
    required: true,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  reputation: {
    type: Number,
    default: 0
  },
  uploadedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  bookmarkedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  votedResources: [{
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote']
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['student', 'moderator', 'admin'],
    default: 'student'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

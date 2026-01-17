/**
 * Item Model
 * 
 * MongoDB schema for items.
 * Handles item creation with conditional fields based on item_type.
 * Supports PHYSICAL, DIGITAL, and SERVICE item types.
 */

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  // Core fields
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name must not exceed 100 characters'],
    match: [/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'],
    trim: true
  },
  // Normalized fields for duplicate detection and similarity matching
  normalizedName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  normalizedNamePrefix: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description must not exceed 500 characters'],
    trim: true
  },
  item_type: {
    type: String,
    required: [true, 'Item type is required'],
    enum: {
      values: ['PHYSICAL', 'DIGITAL', 'SERVICE'],
      message: 'Item type must be PHYSICAL, DIGITAL, or SERVICE'
    },
    uppercase: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be at least $0.01'],
    max: [999999.99, 'Price must not exceed $999,999.99'],
    set: function(value) {
      // Round to 2 decimal places
      return Math.round(value * 100) / 100;
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    minlength: [1, 'Category must be at least 1 character'],
    maxlength: [50, 'Category must not exceed 50 characters'],
    trim: true
  },
  // Normalized category (Title Case) for consistent matching
  normalizedCategory: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        // Max 10 tags
        if (tags && tags.length > 10) {
          return false;
        }
        // Each tag: 1-30 characters, no duplicates
        const uniqueTags = new Set(tags);
        if (uniqueTags.size !== tags.length) {
          return false;
        }
        return tags.every(tag => tag.length >= 1 && tag.length <= 30);
      },
      message: 'Tags must be unique, max 10 tags, each 1-30 characters'
    },
    default: []
  },
  
  // Conditional fields for PHYSICAL items
  weight: {
    type: Number,
    required: function() {
      return this.item_type === 'PHYSICAL';
    },
    min: [0.01, 'Weight must be greater than 0'],
    validate: {
      validator: function(value) {
        // Only required if item_type is PHYSICAL
        if (this.item_type === 'PHYSICAL') {
          return value != null && value > 0;
        }
        return true; // Not required for other types
      },
      message: 'Weight is required for physical items and must be greater than 0'
    }
  },
  dimensions: {
    length: {
      type: Number,
      required: function() {
        return this.item_type === 'PHYSICAL';
      },
      min: [0.01, 'Length must be greater than 0'],
      validate: {
        validator: function(value) {
          if (this.item_type === 'PHYSICAL') {
            return value != null && value > 0;
          }
          return true;
        },
        message: 'Length is required for physical items and must be greater than 0'
      }
    },
    width: {
      type: Number,
      required: function() {
        return this.item_type === 'PHYSICAL';
      },
      min: [0.01, 'Width must be greater than 0'],
      validate: {
        validator: function(value) {
          if (this.item_type === 'PHYSICAL') {
            return value != null && value > 0;
          }
          return true;
        },
        message: 'Width is required for physical items and must be greater than 0'
      }
    },
    height: {
      type: Number,
      required: function() {
        return this.item_type === 'PHYSICAL';
      },
      min: [0.01, 'Height must be greater than 0'],
      validate: {
        validator: function(value) {
          if (this.item_type === 'PHYSICAL') {
            return value != null && value > 0;
          }
          return true;
        },
        message: 'Height is required for physical items and must be greater than 0'
      }
    }
  },
  
  // Conditional fields for DIGITAL items
  download_url: {
    type: String,
    required: function() {
      return this.item_type === 'DIGITAL';
    },
    validate: {
      validator: function(value) {
        if (this.item_type === 'DIGITAL') {
          if (!value) return false;
          // Basic URL validation
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        }
        return true; // Not required for other types
      },
      message: 'Download URL is required for digital items and must be a valid URL'
    }
  },
  file_size: {
    type: Number,
    required: function() {
      return this.item_type === 'DIGITAL';
    },
    min: [1, 'File size must be greater than 0'],
    validate: {
      validator: function(value) {
        if (this.item_type === 'DIGITAL') {
          return value != null && value > 0;
        }
        return true;
      },
      message: 'File size is required for digital items and must be greater than 0'
    }
  },
  
  // Conditional fields for SERVICE items
  duration_hours: {
    type: Number,
    required: function() {
      return this.item_type === 'SERVICE';
    },
    min: [1, 'Duration must be at least 1 hour'],
    validate: {
      validator: function(value) {
        if (this.item_type === 'SERVICE') {
          return value != null && value >= 1;
        }
        return true;
      },
      message: 'Duration hours is required for service items and must be at least 1'
    }
  },
  
  // File upload metadata (optional)
  file_path: {
    type: String,
    default: null
  },
  file_metadata: {
    original_name: String,
    content_type: String,
    size: Number,
    uploaded_at: Date
  },
  
  // Embedded content URL (optional, for Flow 4 iframe)
  embed_url: {
    type: String,
    default: null,
    validate: {
      validator: function(value) {
        // If provided, must be a valid URL
        if (!value) return true; // Optional field
        try {
          const url = new URL(value);
          // Only allow http:// and https:// protocols
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      message: 'embed_url must be a valid HTTP or HTTPS URL'
    }
  },
  
  // Metadata
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required'],
    index: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  version: {
    type: Number,
    default: 1,
    min: [1, 'Version must be at least 1'],
    required: true
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Remove internal normalized fields from JSON output
      delete ret.normalizedName;
      delete ret.normalizedNamePrefix;
      delete ret.normalizedCategory;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes
// Compound unique index for duplicate prevention (normalizedName + normalizedCategory)
// This prevents duplicates at database level, handling concurrent requests
itemSchema.index({ 
  normalizedName: 1, 
  normalizedCategory: 1,
  created_by: 1
}, { 
  unique: true, 
  name: 'unique_item_name_category_user',
  // Partial index: only for active items
  partialFilterExpression: { is_active: true }
});

// Compound index for filtering by normalized category and item_type
itemSchema.index({ normalizedCategory: 1, item_type: 1 }, { name: 'idx_category_item_type' });

// Index for similarity matching (adaptive prefix + category)
itemSchema.index({ 
  normalizedNamePrefix: 1, 
  normalizedCategory: 1,
  created_by: 1,
  is_active: 1
}, { name: 'idx_similar_items' });

// Index for filtering by creator
itemSchema.index({ created_by: 1 }, { name: 'idx_created_by' });

// Index for tag search
itemSchema.index({ tags: 1 }, { name: 'idx_tags' });

// Index for sorting by creation date
itemSchema.index({ createdAt: -1 }, { name: 'idx_created_at' });

// Index for active items filtering
itemSchema.index({ is_active: 1, createdAt: -1 }, { name: 'idx_active_created' });

// Pre-save hook to generate normalized fields and validate conditional fields
itemSchema.pre('save', function(next) {
  // Normalize name: lowercase + whitespace normalization
  if (this.isModified('name') || this.isNew) {
    this.normalizedName = this.name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Generate adaptive prefix for similarity matching
    const nameLength = this.normalizedName.length;
    if (nameLength === 0) {
      this.normalizedNamePrefix = '';
    } else if (nameLength <= 2) {
      // 1-2 chars: use entire name
      this.normalizedNamePrefix = this.normalizedName;
    } else if (nameLength <= 4) {
      // 3-4 chars: use all but last character
      this.normalizedNamePrefix = this.normalizedName.substring(0, nameLength - 1);
    } else {
      // 5+ chars: use first 5 characters
      this.normalizedNamePrefix = this.normalizedName.substring(0, 5);
    }
  }
  
  // Normalize category to Title Case
  if (this.isModified('category') || this.isNew) {
    this.normalizedCategory = this.category.trim().replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
  
  // Clear conditional fields that don't apply to current item_type
  if (this.item_type !== 'PHYSICAL') {
    this.weight = undefined;
    this.dimensions = undefined;
  }
  if (this.item_type !== 'DIGITAL') {
    this.download_url = undefined;
    this.file_size = undefined;
  }
  if (this.item_type !== 'SERVICE') {
    this.duration_hours = undefined;
  }
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;


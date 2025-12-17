/**
 * Item Model
 * 
 * MongoDB schema for items.
 * Handles item creation with conditional fields based on item_type.
 * Supports PHYSICAL, DIGITAL, and SERVICE item types.
 */

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name must not exceed 100 characters'],
    match: [/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'],
    trim: true
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
  
  // Metadata
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required'],
    index: true
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Remove internal fields from JSON output if needed
      return ret;
    }
  }
});

// Create indexes
// Compound unique index for duplicate prevention (name + category)
itemSchema.index({ name: 1, category: 1 }, { unique: true, name: 'idx_name_category_unique' });

// Compound index for filtering by category and item_type
itemSchema.index({ category: 1, item_type: 1 }, { name: 'idx_category_item_type' });

// Index for filtering by creator
itemSchema.index({ created_by: 1 }, { name: 'idx_created_by' });

// Index for tag search
itemSchema.index({ tags: 1 }, { name: 'idx_tags' });

// Index for sorting by creation date
itemSchema.index({ createdAt: -1 }, { name: 'idx_created_at' });

// Index for active items filtering
itemSchema.index({ is_active: 1, createdAt: -1 }, { name: 'idx_active_created' });

// Pre-save hook to validate conditional fields
itemSchema.pre('save', function(next) {
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


/**
 * Database Connection Configuration
 * 
 * Handles MongoDB connection using Mongoose.
 * Provides connection event handlers for monitoring connection status.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * 
 * Uses connection string from environment variable MONGODB_URI.
 * Sets up event handlers for connection monitoring.
 * 
 * @returns {Promise<void>}
 */
async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Enable transactions support
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = {
  connectDatabase,
  mongoose
};


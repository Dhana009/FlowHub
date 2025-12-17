/**
 * Database Test Helper
 * 
 * Utilities for setting up and tearing down test databases.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Setup in-memory MongoDB for testing
 * 
 * @returns {Promise<void>}
 */
async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

/**
 * Cleanup test database
 * 
 * @returns {Promise<void>}
 */
async function cleanupTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/**
 * Clear all collections
 * 
 * @returns {Promise<void>}
 */
async function clearCollections() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = {
  setupTestDB,
  cleanupTestDB,
  clearCollections
};


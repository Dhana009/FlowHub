/**
 * Server Entry Point
 * 
 * This is the main entry point for the backend server.
 * Loads environment variables, connects to database, and starts the Express server.
 */

// Load environment variables from .env file
require('dotenv').config();

const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to MongoDB (non-blocking for Phase 2 testing)
    console.log('Connecting to MongoDB...');
    connectDatabase().catch((error) => {
      console.warn('⚠️  MongoDB connection failed (server will continue without DB):', error.message);
      console.warn('   This is OK for Phase 2 testing. Start MongoDB for full functionality.\n');
    });

    // Start Express server
    // Render requires binding to 0.0.0.0, not just localhost
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    
    app.listen(PORT, host, () => {
      console.log(`\n🚀 FlowHub Backend Server`);
      console.log(`   Environment: ${NODE_ENV}`);
      console.log(`   Server running on: http://${host}:${PORT}`);
      console.log(`   API Base URL: http://${host}:${PORT}/api/v1`);
      console.log(`   Health Check: http://${host}:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();


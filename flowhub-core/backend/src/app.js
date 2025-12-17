/**
 * Express Application Setup
 * 
 * Configures Express app with middleware, routes, and error handling.
 * This is the main application file (not the server entry point).
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

const app = express();

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // Allow cookies (for refresh token)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware (for refresh token cookies)
app.use(cookieParser());

// Health check endpoint (for testing)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'FlowHub Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/items', itemRoutes);

// Static file serving for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404
  });
});

// Global error handler middleware
// This must be the last middleware
app.use(errorHandler);

module.exports = app;


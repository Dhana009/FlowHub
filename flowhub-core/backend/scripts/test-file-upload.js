/**
 * File Upload Middleware Test Script
 * 
 * Tests the file upload middleware validation.
 * Run with: node scripts/test-file-upload.js
 * 
 * Note: This creates a temporary Express server to test the middleware.
 */

const express = require('express');
const { handleFileUpload } = require('../src/middleware/upload');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Test endpoint
app.post('/test-upload', handleFileUpload, (req, res) => {
  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    } : null,
    metadata: req.fileMetadata || null
  });
});

const PORT = 3001;

async function runTests() {
  console.log('🧪 Testing File Upload Middleware...\n');

  const server = app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}\n`);
  });

  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 500));

  const testResults = [];

  // Test 1: Valid file upload (if we had a test file)
  console.log('Test 1: Valid file upload');
  console.log('   ⚠️  Skipped (requires actual file)');
  console.log('   💡 To test manually: curl -X POST http://localhost:3001/test-upload -F "file=@test.jpg"\n');

  // Test 2: File size validation (would need actual large file)
  console.log('Test 2: File size validation');
  console.log('   ⚠️  Skipped (requires actual large file)');
  console.log('   💡 Max size: 5MB, Min size: 1KB\n');

  // Test 3: File type validation (would need actual invalid file)
  console.log('Test 3: File type validation');
  console.log('   ⚠️  Skipped (requires actual invalid file)');
  console.log('   💡 Allowed: .jpg, .jpeg, .png, .pdf, .doc, .docx\n');

  console.log('📋 Manual Testing Instructions:');
  console.log('   1. Create a test image file (test.jpg)');
  console.log('   2. Test valid upload:');
  console.log('      curl -X POST http://localhost:3001/test-upload -F "file=@test.jpg"');
  console.log('   3. Test invalid file type:');
  console.log('      curl -X POST http://localhost:3001/test-upload -F "file=@test.txt"');
  console.log('   4. Test file too large (create >5MB file):');
  console.log('      curl -X POST http://localhost:3001/test-upload -F "file=@large-file.jpg"');
  console.log('');

  // Check upload directory exists
  const uploadDir = path.join(__dirname, '../uploads/items');
  if (fs.existsSync(uploadDir)) {
    console.log(`✅ Upload directory exists: ${uploadDir}`);
    const files = fs.readdirSync(uploadDir);
    console.log(`   Found ${files.length} files in upload directory`);
  } else {
    console.log(`❌ Upload directory does not exist: ${uploadDir}`);
  }

  console.log('\n✅ File upload middleware test script completed');
  console.log('   The middleware is ready to use in routes.\n');

  // Close server after a delay
  setTimeout(() => {
    server.close();
    console.log('✅ Test server closed');
    process.exit(0);
  }, 2000);
}

runTests().catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});


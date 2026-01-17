import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with the credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test upload of a small base64 encoded image
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'chocolate-app/test'
    });
    
    console.log('✅ Cloudinary test upload successful!');
    console.log('Public ID:', result.public_id);
    console.log('URL:', result.secure_url);
    
    // Clean up - delete the test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('🧹 Test image cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    return false;
  }
}

// Run the test
testCloudinaryConnection()
  .then(success => {
    console.log(success ? 'Test passed!' : 'Test failed!');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
  });
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadHeroImage() {
  try {
    console.log('Uploading hero image to Cloudinary...');
    
    const result = await cloudinary.uploader.upload(
      path.join(process.cwd(), 'public', '3.jpg.jpeg'),
      {
        folder: 'cleohn',
        public_id: 'hero-background',
        transformation: [
          { width: 1920, height: 1080, crop: 'fill', quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        overwrite: true,
      }
    );

    console.log('✅ Upload successful!');
    console.log('Image URL:', result.secure_url);
    console.log('\nUpdate your code with:');
    console.log(`const HERO_IMAGE = "${result.secure_url}"`);
    
    return result;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

uploadHeroImage();

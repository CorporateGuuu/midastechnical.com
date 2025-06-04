#!/usr/bin/env node

/**
 * Production Asset Optimization and CDN Upload
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function uploadAssetsToCloudinary() {
  console.log('📤 Uploading assets to Cloudinary CDN...');

  const imageDir = path.join(__dirname, '..', 'public', 'images');
  let uploadCount = 0;

  const uploadDirectory = async (dir, folder) => {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        await uploadDirectory(itemPath, `${folder}/${item}`);
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(item)) {
        try {
          const result = await cloudinary.uploader.upload(itemPath, {
            folder: folder,
            public_id: path.basename(item, path.extname(item)),
            overwrite: true,
            resource_type: 'image',
            format: 'webp',
            quality: 'auto:good'
          });

          uploadCount++;
          console.log(`   ✅ Uploaded: ${result.public_id}`);

        } catch (error) {
          console.error(`   ❌ Failed to upload ${item}:`, error.message);
        }
      }
    }
  };

  // Upload product images
  await uploadDirectory(path.join(imageDir, 'products'), 'midastechnical/products');

  // Upload category images
  await uploadDirectory(path.join(imageDir, 'categories'), 'midastechnical/categories');

  console.log(`📊 Total assets uploaded: ${uploadCount}`);
}

if (require.main === module) {
  uploadAssetsToCloudinary().catch(console.error);
}

module.exports = { uploadAssetsToCloudinary };

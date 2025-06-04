#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { Pool } = require('pg');
const sharp = require('sharp');

// Database configuration
const dbName = 'midastechnical_store';
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:postgres@localhost:5432/${dbName}`;

// Create database connection
const pool = new Pool({
  connectionString,
});

// Create directories for images
const imageBaseDir = path.join(__dirname, 'public', 'images', 'products');
const categoriesDir = {
  'iPhone Parts': path.join(imageBaseDir, 'iphone'),
  'Samsung Parts': path.join(imageBaseDir, 'samsung'),
  'iPad Parts': path.join(imageBaseDir, 'ipad'),
  'MacBook Parts': path.join(imageBaseDir, 'macbook'),
  'LCD Screens': path.join(imageBaseDir, 'lcd'),
  'Batteries': path.join(imageBaseDir, 'batteries'),
  'Charging Ports': path.join(imageBaseDir, 'charging'),
  'Cameras': path.join(imageBaseDir, 'cameras'),
  'Speakers': path.join(imageBaseDir, 'speakers'),
  'Repair Tools': path.join(imageBaseDir, 'tools')
};

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(imageBaseDir)) {
    fs.mkdirSync(imageBaseDir, { recursive: true });
  }
  
  Object.values(categoriesDir).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(filepath);
        });
        
        fileStream.on('error', reject);
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
        } else {
          reject(new Error(`Redirect without location header: ${response.statusCode}`));
        }
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.abort();
      reject(new Error('Download timeout'));
    });
  });
}

// Optimize image using Sharp
async function optimizeImage(inputPath, outputPath, options = {}) {
  const { width = 800, quality = 85 } = options;
  
  try {
    await sharp(inputPath)
      .resize(width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality })
      .toFile(outputPath);
    
    // Remove original file
    fs.unlinkSync(inputPath);
    
    return outputPath;
  } catch (error) {
    console.warn(`Failed to optimize image ${inputPath}:`, error.message);
    return inputPath;
  }
}

// Generate filename from URL and product info
function generateFilename(url, productSku, index = 0) {
  const urlParts = url.split('/');
  const originalFilename = urlParts[urlParts.length - 1];
  const extension = path.extname(originalFilename) || '.webp';
  const baseName = `${productSku}${index > 0 ? `-${index}` : ''}`;
  
  return `${baseName}${extension}`;
}

async function downloadProductImages() {
  console.log('🖼️  Starting product image download and optimization...');
  
  try {
    ensureDirectories();
    
    // Get products with image URLs
    const productsResult = await pool.query(`
      SELECT 
        p.id, p.sku, p.name, p.image_url,
        c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.image_url IS NOT NULL 
        AND p.image_url != ''
        AND p.image_url LIKE 'http%'
      ORDER BY p.id
      LIMIT 100
    `);
    
    const products = productsResult.rows;
    console.log(`📊 Found ${products.length} products with image URLs`);
    
    let downloadedCount = 0;
    let optimizedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const categoryDir = categoriesDir[product.category_name] || categoriesDir['iPhone Parts'];
      
      try {
        console.log(`📥 [${i + 1}/${products.length}] Processing: ${product.name.substring(0, 50)}...`);
        
        // Generate filename
        const filename = generateFilename(product.image_url, product.sku);
        const tempPath = path.join(categoryDir, `temp_${filename}`);
        const finalPath = path.join(categoryDir, filename.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
        
        // Skip if file already exists
        if (fs.existsSync(finalPath)) {
          console.log(`   ⏭️  Image already exists, skipping`);
          continue;
        }
        
        // Download image
        await downloadImage(product.image_url, tempPath);
        downloadedCount++;
        
        // Optimize image
        const optimizedPath = await optimizeImage(tempPath, finalPath, {
          width: 800,
          quality: 85
        });
        optimizedCount++;
        
        // Update database with local image path
        const relativePath = `/images/products/${path.relative(imageBaseDir, optimizedPath)}`;
        await pool.query(`
          UPDATE products 
          SET image_url = $1 
          WHERE id = $2
        `, [relativePath, product.id]);
        
        // Update product_images table
        await pool.query(`
          UPDATE product_images 
          SET image_url = $1 
          WHERE product_id = $2 AND is_primary = true
        `, [relativePath, product.id]);
        
        console.log(`   ✅ Downloaded and optimized: ${relativePath}`);
        
        // Add small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`   ⚠️  Failed to process image for ${product.name}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Generate thumbnails for existing images
    console.log('\n🔄 Generating thumbnails...');
    let thumbnailCount = 0;
    
    for (const [categoryName, categoryPath] of Object.entries(categoriesDir)) {
      if (!fs.existsSync(categoryPath)) continue;
      
      const files = fs.readdirSync(categoryPath).filter(file => 
        file.endsWith('.webp') && !file.includes('thumb')
      );
      
      for (const file of files) {
        try {
          const inputPath = path.join(categoryPath, file);
          const thumbPath = path.join(categoryPath, file.replace('.webp', '_thumb.webp'));
          
          if (!fs.existsSync(thumbPath)) {
            await sharp(inputPath)
              .resize(300, 300, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .webp({ quality: 75 })
              .toFile(thumbPath);
            
            thumbnailCount++;
          }
        } catch (error) {
          console.warn(`Failed to create thumbnail for ${file}:`, error.message);
        }
      }
    }
    
    // Final statistics
    const finalStats = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN image_url LIKE '/images/products/%' THEN 1 END) as local_images,
        COUNT(CASE WHEN image_url LIKE 'http%' THEN 1 END) as remote_images
      FROM products
    `);
    
    console.log('\n🎉 Image processing completed!');
    console.log('📊 Statistics:');
    console.log(`   Downloaded: ${downloadedCount} images`);
    console.log(`   Optimized: ${optimizedCount} images`);
    console.log(`   Thumbnails: ${thumbnailCount} created`);
    console.log(`   Errors: ${errorCount} failed`);
    console.log(`   Local images: ${finalStats.rows[0].local_images}`);
    console.log(`   Remote images: ${finalStats.rows[0].remote_images}`);
    
    // List directory contents
    console.log('\n📁 Image directories:');
    Object.entries(categoriesDir).forEach(([category, dir]) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        console.log(`   ${category}: ${files.length} files`);
      }
    });
    
    return {
      downloaded: downloadedCount,
      optimized: optimizedCount,
      thumbnails: thumbnailCount,
      errors: errorCount
    };
    
  } catch (error) {
    console.error('❌ Error processing images:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the image processing if this script is executed directly
if (require.main === module) {
  downloadProductImages()
    .then(stats => {
      console.log(`\n✅ Image processing completed successfully!`);
      console.log(`📊 Final stats: ${JSON.stringify(stats, null, 2)}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Image processing failed:', error);
      process.exit(1);
    });
}

module.exports = { downloadProductImages };

#!/usr/bin/env node

/**
 * Production Sitemap Generator for midastechnical.com
 * Generates comprehensive sitemaps for SEO optimization
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DOMAIN = 'https://midastechnical.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/midastechnical_store'
});

class ProductionSitemapGenerator {
  constructor() {
    this.sitemaps = {
      main: [],
      products: [],
      categories: [],
      blog: [],
      static: []
    };
  }

  async generate() {
    console.log('🗺️  Generating production sitemaps for midastechnical.com...');
    
    try {
      // Generate static pages sitemap
      await this.generateStaticPages();
      
      // Generate products sitemap
      await this.generateProductsSitemap();
      
      // Generate categories sitemap
      await this.generateCategoriesSitemap();
      
      // Generate blog sitemap
      await this.generateBlogSitemap();
      
      // Generate main sitemap index
      await this.generateMainSitemap();
      
      // Write all sitemaps
      await this.writeSitemaps();
      
      console.log('✅ Production sitemaps generated successfully!');
      
    } catch (error) {
      console.error('❌ Error generating sitemaps:', error);
      throw error;
    } finally {
      await pool.end();
    }
  }

  async generateStaticPages() {
    console.log('📄 Generating static pages sitemap...');
    
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/products', priority: 0.9, changefreq: 'daily' },
      { url: '/categories', priority: 0.8, changefreq: 'weekly' },
      { url: '/about', priority: 0.7, changefreq: 'monthly' },
      { url: '/contact', priority: 0.7, changefreq: 'monthly' },
      { url: '/help-center', priority: 0.6, changefreq: 'weekly' },
      { url: '/faq', priority: 0.6, changefreq: 'monthly' },
      { url: '/shipping', priority: 0.6, changefreq: 'monthly' },
      { url: '/return-policy', priority: 0.6, changefreq: 'monthly' },
      { url: '/privacy', priority: 0.5, changefreq: 'yearly' },
      { url: '/terms', priority: 0.5, changefreq: 'yearly' },
      { url: '/wholesale', priority: 0.7, changefreq: 'monthly' },
      { url: '/device-grading', priority: 0.6, changefreq: 'monthly' },
      { url: '/quality-standards', priority: 0.6, changefreq: 'monthly' },
      { url: '/careers', priority: 0.5, changefreq: 'monthly' },
      { url: '/blog', priority: 0.7, changefreq: 'weekly' }
    ];

    this.sitemaps.static = staticPages.map(page => ({
      ...page,
      lastmod: new Date().toISOString().split('T')[0]
    }));
  }

  async generateProductsSitemap() {
    console.log('📦 Generating products sitemap...');
    
    const products = await pool.query(`
      SELECT 
        p.slug,
        p.updated_at,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug IS NOT NULL
      ORDER BY p.updated_at DESC
    `);

    this.sitemaps.products = products.rows.map(product => ({
      url: `/products/${product.slug}`,
      lastmod: product.updated_at.toISOString().split('T')[0],
      priority: 0.8,
      changefreq: 'weekly',
      images: [`${DOMAIN}/images/products/${product.category_slug}/${product.slug}.webp`]
    }));

    console.log(`   📊 Generated ${this.sitemaps.products.length} product URLs`);
  }

  async generateCategoriesSitemap() {
    console.log('📂 Generating categories sitemap...');
    
    const categories = await pool.query(`
      SELECT 
        c.slug,
        c.updated_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.slug IS NOT NULL
      GROUP BY c.id, c.slug, c.updated_at
      ORDER BY product_count DESC
    `);

    this.sitemaps.categories = categories.rows.map(category => ({
      url: `/categories/${category.slug}`,
      lastmod: category.updated_at.toISOString().split('T')[0],
      priority: 0.7,
      changefreq: 'weekly'
    }));

    console.log(`   📊 Generated ${this.sitemaps.categories.length} category URLs`);
  }

  async generateBlogSitemap() {
    console.log('📰 Generating blog sitemap...');
    
    try {
      const blogPosts = await pool.query(`
        SELECT 
          slug,
          updated_at
        FROM content_pages
        WHERE published = true AND slug IS NOT NULL
        ORDER BY updated_at DESC
      `);

      this.sitemaps.blog = blogPosts.rows.map(post => ({
        url: `/blog/${post.slug}`,
        lastmod: post.updated_at.toISOString().split('T')[0],
        priority: 0.6,
        changefreq: 'monthly'
      }));

      console.log(`   📊 Generated ${this.sitemaps.blog.length} blog URLs`);
    } catch (error) {
      console.warn('   ⚠️  Blog table not found, skipping blog sitemap');
      this.sitemaps.blog = [];
    }
  }

  async generateMainSitemap() {
    console.log('🗂️  Generating main sitemap index...');
    
    const sitemapIndex = [
      { url: `${DOMAIN}/sitemap-static.xml`, lastmod: new Date().toISOString().split('T')[0] },
      { url: `${DOMAIN}/sitemap-products.xml`, lastmod: new Date().toISOString().split('T')[0] },
      { url: `${DOMAIN}/sitemap-categories.xml`, lastmod: new Date().toISOString().split('T')[0] }
    ];

    if (this.sitemaps.blog.length > 0) {
      sitemapIndex.push({ url: `${DOMAIN}/sitemap-blog.xml`, lastmod: new Date().toISOString().split('T')[0] });
    }

    this.sitemaps.main = sitemapIndex;
  }

  generateSitemapXML(urls, type = 'urlset') {
    if (type === 'sitemapindex') {
      return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(sitemap => `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(url => `  <url>
    <loc>${DOMAIN}${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>${url.images ? `
    <image:image>
      <image:loc>${url.images[0]}</image:loc>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;
  }

  async writeSitemaps() {
    console.log('💾 Writing sitemap files...');
    
    // Write main sitemap index
    const mainSitemapXML = this.generateSitemapXML(this.sitemaps.main, 'sitemapindex');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), mainSitemapXML);
    
    // Write static pages sitemap
    const staticSitemapXML = this.generateSitemapXML(this.sitemaps.static);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-static.xml'), staticSitemapXML);
    
    // Write products sitemap
    const productsSitemapXML = this.generateSitemapXML(this.sitemaps.products);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-products.xml'), productsSitemapXML);
    
    // Write categories sitemap
    const categoriesSitemapXML = this.generateSitemapXML(this.sitemaps.categories);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-categories.xml'), categoriesSitemapXML);
    
    // Write blog sitemap if exists
    if (this.sitemaps.blog.length > 0) {
      const blogSitemapXML = this.generateSitemapXML(this.sitemaps.blog);
      fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-blog.xml'), blogSitemapXML);
    }

    console.log('   ✅ All sitemap files written successfully');
    
    // Generate summary
    const totalUrls = this.sitemaps.static.length + 
                     this.sitemaps.products.length + 
                     this.sitemaps.categories.length + 
                     this.sitemaps.blog.length;
    
    console.log('\n📊 SITEMAP GENERATION SUMMARY:');
    console.log(`   Static Pages: ${this.sitemaps.static.length} URLs`);
    console.log(`   Products: ${this.sitemaps.products.length} URLs`);
    console.log(`   Categories: ${this.sitemaps.categories.length} URLs`);
    console.log(`   Blog Posts: ${this.sitemaps.blog.length} URLs`);
    console.log(`   Total URLs: ${totalUrls}`);
    console.log('\n🔗 Generated Files:');
    console.log('   📄 /sitemap.xml (main index)');
    console.log('   📄 /sitemap-static.xml');
    console.log('   📄 /sitemap-products.xml');
    console.log('   📄 /sitemap-categories.xml');
    if (this.sitemaps.blog.length > 0) {
      console.log('   📄 /sitemap-blog.xml');
    }
  }
}

async function main() {
  const generator = new ProductionSitemapGenerator();
  await generator.generate();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Sitemap generation failed:', error);
    process.exit(1);
  });
}

module.exports = { ProductionSitemapGenerator };

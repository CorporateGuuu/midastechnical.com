#!/usr/bin/env node

/**
 * Production Deployment Script for midastechnical.com
 * Handles pre-deployment checks, build optimization, and deployment verification
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Pool } = require('pg');

class ProductionDeployment {
  constructor() {
    this.checks = {
      environment: false,
      database: false,
      build: false,
      security: false,
      performance: false,
      integrations: false
    };
    this.errors = [];
    this.warnings = [];
  }

  async runDeploymentChecklist() {
    console.log('🚀 Starting Production Deployment Checklist for midastechnical.com');
    console.log('=' .repeat(70));
    
    try {
      // Step 1: Environment Variables Check
      await this.checkEnvironmentVariables();
      
      // Step 2: Database Connectivity Check
      await this.checkDatabaseConnection();
      
      // Step 3: Build and Dependencies Check
      await this.checkBuildProcess();
      
      // Step 4: Security Configuration Check
      await this.checkSecurityConfiguration();
      
      // Step 5: Performance Optimization Check
      await this.checkPerformanceOptimization();
      
      // Step 6: External Integrations Check
      await this.checkExternalIntegrations();
      
      // Step 7: Generate Deployment Report
      await this.generateDeploymentReport();
      
      // Step 8: Create Deployment Package
      await this.createDeploymentPackage();
      
    } catch (error) {
      console.error('❌ Deployment checklist failed:', error);
      throw error;
    }
  }

  async checkEnvironmentVariables() {
    console.log('\n🔧 Checking Environment Variables...');
    
    const requiredEnvVars = [
      'NODE_ENV',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'DATABASE_URL',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'SENDGRID_API_KEY',
      'CLOUDINARY_CLOUD_NAME',
      'NEXT_PUBLIC_GA_TRACKING_ID'
    ];
    
    const missingVars = [];
    const mockVars = [];
    
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      
      if (!value) {
        missingVars.push(envVar);
      } else if (value.includes('PROD_') || value.includes('your-') || value.includes('mock-')) {
        mockVars.push(envVar);
      }
    }
    
    if (missingVars.length > 0) {
      this.errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
      console.log(`   ❌ Missing variables: ${missingVars.join(', ')}`);
    }
    
    if (mockVars.length > 0) {
      this.warnings.push(`Mock/placeholder values detected: ${mockVars.join(', ')}`);
      console.log(`   ⚠️  Mock values: ${mockVars.join(', ')}`);
    }
    
    // Check NODE_ENV
    if (process.env.NODE_ENV !== 'production') {
      this.warnings.push('NODE_ENV is not set to production');
      console.log('   ⚠️  NODE_ENV is not set to production');
    }
    
    // Check NEXTAUTH_URL
    if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('midastechnical.com')) {
      this.warnings.push('NEXTAUTH_URL does not point to production domain');
      console.log('   ⚠️  NEXTAUTH_URL does not point to production domain');
    }
    
    if (missingVars.length === 0) {
      this.checks.environment = true;
      console.log('   ✅ Environment variables check passed');
    }
  }

  async checkDatabaseConnection() {
    console.log('\n🗄️  Checking Database Connection...');
    
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL
      });
      
      // Test connection
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      
      // Check if required tables exist
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const requiredTables = ['products', 'categories', 'users', 'orders'];
      const existingTables = tables.rows.map(row => row.table_name);
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        this.errors.push(`Missing database tables: ${missingTables.join(', ')}`);
        console.log(`   ❌ Missing tables: ${missingTables.join(', ')}`);
      }
      
      // Check product count
      const productCount = await client.query('SELECT COUNT(*) FROM products');
      const count = parseInt(productCount.rows[0].count);
      
      if (count < 500) {
        this.warnings.push(`Product count (${count}) is below recommended minimum (500)`);
        console.log(`   ⚠️  Product count: ${count} (recommended: 500+)`);
      } else {
        console.log(`   ✅ Product count: ${count}`);
      }
      
      client.release();
      await pool.end();
      
      if (missingTables.length === 0) {
        this.checks.database = true;
        console.log('   ✅ Database connection check passed');
      }
      
    } catch (error) {
      this.errors.push(`Database connection failed: ${error.message}`);
      console.log(`   ❌ Database connection failed: ${error.message}`);
    }
  }

  async checkBuildProcess() {
    console.log('\n🔨 Checking Build Process...');
    
    try {
      // Check if package.json exists
      if (!fs.existsSync('package.json')) {
        this.errors.push('package.json not found');
        console.log('   ❌ package.json not found');
        return;
      }
      
      // Check if node_modules exists
      if (!fs.existsSync('node_modules')) {
        console.log('   📦 Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
      }
      
      // Run build process
      console.log('   🔨 Running production build...');
      execSync('npm run build', { stdio: 'inherit' });
      
      // Check if .next directory was created
      if (!fs.existsSync('.next')) {
        this.errors.push('Build output directory (.next) not found');
        console.log('   ❌ Build output directory not found');
        return;
      }
      
      // Check build size
      const buildStats = this.getBuildStats();
      console.log(`   📊 Build size: ${buildStats.totalSize}MB`);
      
      if (buildStats.totalSize > 100) {
        this.warnings.push(`Build size (${buildStats.totalSize}MB) is quite large`);
        console.log(`   ⚠️  Large build size: ${buildStats.totalSize}MB`);
      }
      
      this.checks.build = true;
      console.log('   ✅ Build process check passed');
      
    } catch (error) {
      this.errors.push(`Build process failed: ${error.message}`);
      console.log(`   ❌ Build process failed: ${error.message}`);
    }
  }

  async checkSecurityConfiguration() {
    console.log('\n🔒 Checking Security Configuration...');
    
    const securityChecks = [];
    
    // Check if HTTPS is enforced
    if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.startsWith('https://')) {
      securityChecks.push('✅ HTTPS enforced');
    } else {
      securityChecks.push('❌ HTTPS not enforced');
      this.errors.push('HTTPS not enforced in NEXTAUTH_URL');
    }
    
    // Check if secure secrets are used
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32) {
      securityChecks.push('✅ Secure NextAuth secret');
    } else {
      securityChecks.push('❌ Weak NextAuth secret');
      this.errors.push('NextAuth secret is too short or missing');
    }
    
    // Check middleware configuration
    if (fs.existsSync('middleware.js') || fs.existsSync('middleware.production.js')) {
      securityChecks.push('✅ Security middleware configured');
    } else {
      securityChecks.push('⚠️  Security middleware not found');
      this.warnings.push('Security middleware not configured');
    }
    
    // Check CSP configuration in next.config.js
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    if (nextConfig.includes('Content-Security-Policy')) {
      securityChecks.push('✅ CSP headers configured');
    } else {
      securityChecks.push('⚠️  CSP headers not configured');
      this.warnings.push('Content Security Policy not configured');
    }
    
    securityChecks.forEach(check => console.log(`   ${check}`));
    
    const passedChecks = securityChecks.filter(check => check.includes('✅')).length;
    if (passedChecks >= 3) {
      this.checks.security = true;
      console.log('   ✅ Security configuration check passed');
    }
  }

  async checkPerformanceOptimization() {
    console.log('\n⚡ Checking Performance Optimization...');
    
    const performanceChecks = [];
    
    // Check if images are optimized
    const imageDir = path.join('public', 'images', 'products');
    if (fs.existsSync(imageDir)) {
      const imageFiles = fs.readdirSync(imageDir, { recursive: true });
      const webpFiles = imageFiles.filter(file => file.endsWith('.webp'));
      const totalImages = imageFiles.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
      
      const webpPercentage = (webpFiles.length / totalImages.length) * 100;
      
      if (webpPercentage > 80) {
        performanceChecks.push('✅ Images optimized (WebP)');
      } else {
        performanceChecks.push(`⚠️  Only ${webpPercentage.toFixed(1)}% images optimized`);
        this.warnings.push(`Only ${webpPercentage.toFixed(1)}% of images are in WebP format`);
      }
    }
    
    // Check if compression is enabled
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    if (nextConfig.includes('compress: true')) {
      performanceChecks.push('✅ Compression enabled');
    } else {
      performanceChecks.push('⚠️  Compression not explicitly enabled');
      this.warnings.push('Compression not explicitly enabled in Next.js config');
    }
    
    // Check if caching headers are configured
    if (nextConfig.includes('Cache-Control')) {
      performanceChecks.push('✅ Caching headers configured');
    } else {
      performanceChecks.push('⚠️  Caching headers not configured');
      this.warnings.push('Caching headers not configured');
    }
    
    performanceChecks.forEach(check => console.log(`   ${check}`));
    
    const passedChecks = performanceChecks.filter(check => check.includes('✅')).length;
    if (passedChecks >= 2) {
      this.checks.performance = true;
      console.log('   ✅ Performance optimization check passed');
    }
  }

  async checkExternalIntegrations() {
    console.log('\n🔗 Checking External Integrations...');
    
    const integrationChecks = [];
    
    // Check Stripe configuration
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      integrationChecks.push('✅ Stripe production keys configured');
    } else if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      integrationChecks.push('⚠️  Stripe test keys detected');
      this.warnings.push('Stripe is using test keys instead of production keys');
    } else {
      integrationChecks.push('❌ Stripe keys missing');
      this.errors.push('Stripe keys not configured');
    }
    
    // Check SendGrid configuration
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      integrationChecks.push('✅ SendGrid configured');
    } else {
      integrationChecks.push('❌ SendGrid not configured');
      this.errors.push('SendGrid API key not configured');
    }
    
    // Check Google Analytics
    if (process.env.NEXT_PUBLIC_GA_TRACKING_ID && process.env.NEXT_PUBLIC_GA_TRACKING_ID.startsWith('G-')) {
      integrationChecks.push('✅ Google Analytics configured');
    } else {
      integrationChecks.push('⚠️  Google Analytics not configured');
      this.warnings.push('Google Analytics tracking ID not configured');
    }
    
    // Check Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      integrationChecks.push('✅ Cloudinary configured');
    } else {
      integrationChecks.push('⚠️  Cloudinary not configured');
      this.warnings.push('Cloudinary CDN not configured');
    }
    
    integrationChecks.forEach(check => console.log(`   ${check}`));
    
    const passedChecks = integrationChecks.filter(check => check.includes('✅')).length;
    if (passedChecks >= 2) {
      this.checks.integrations = true;
      console.log('   ✅ External integrations check passed');
    }
  }

  getBuildStats() {
    try {
      const buildDir = '.next';
      const getDirectorySize = (dirPath) => {
        let totalSize = 0;
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            totalSize += getDirectorySize(filePath);
          } else {
            totalSize += stats.size;
          }
        }
        
        return totalSize;
      };
      
      const totalBytes = getDirectorySize(buildDir);
      const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
      
      return {
        totalSize: parseFloat(totalMB),
        totalBytes
      };
    } catch (error) {
      return { totalSize: 0, totalBytes: 0 };
    }
  }

  async generateDeploymentReport() {
    console.log('\n📊 Generating Deployment Report...');
    
    const passedChecks = Object.values(this.checks).filter(Boolean).length;
    const totalChecks = Object.keys(this.checks).length;
    const successRate = (passedChecks / totalChecks) * 100;
    
    const report = `
# PRODUCTION DEPLOYMENT REPORT
## midastechnical.com

**Generated:** ${new Date().toISOString()}
**Success Rate:** ${successRate.toFixed(1)}% (${passedChecks}/${totalChecks} checks passed)

## DEPLOYMENT READINESS CHECKLIST

${Object.entries(this.checks).map(([check, passed]) => 
  `- [${passed ? 'x' : ' '}] ${check.charAt(0).toUpperCase() + check.slice(1)} Configuration`
).join('\n')}

## ERRORS (${this.errors.length})
${this.errors.length > 0 ? this.errors.map(error => `- ❌ ${error}`).join('\n') : '- None'}

## WARNINGS (${this.warnings.length})
${this.warnings.length > 0 ? this.warnings.map(warning => `- ⚠️  ${warning}`).join('\n') : '- None'}

## DEPLOYMENT STATUS
${successRate >= 80 ? '✅ **READY FOR DEPLOYMENT**' : '❌ **NOT READY FOR DEPLOYMENT**'}

${successRate < 80 ? `
### REQUIRED ACTIONS BEFORE DEPLOYMENT:
${this.errors.map(error => `1. Fix: ${error}`).join('\n')}
` : ''}

## NEXT STEPS
1. Review and address any warnings
2. Configure production hosting platform
3. Set up domain DNS records
4. Deploy to staging environment for testing
5. Deploy to production environment
6. Configure monitoring and alerting
7. Test all critical user flows
8. Monitor application performance

---
*Generated by Production Deployment Script*
`;

    const reportPath = path.join(__dirname, '..', 'DEPLOYMENT_REPORT.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`   📄 Report saved to: ${reportPath}`);
    console.log(`   🎯 Deployment readiness: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('   ✅ Ready for production deployment!');
    } else {
      console.log('   ❌ Not ready for deployment. Please address errors first.');
    }
  }

  async createDeploymentPackage() {
    console.log('\n📦 Creating Deployment Package...');
    
    try {
      // Create deployment directory
      const deployDir = path.join(__dirname, '..', 'deployment');
      if (!fs.existsSync(deployDir)) {
        fs.mkdirSync(deployDir);
      }
      
      // Copy essential files
      const filesToCopy = [
        '.env.production',
        'package.json',
        'package-lock.json',
        'next.config.js',
        'middleware.production.js',
        'public/robots.txt',
        'public/sitemap.xml'
      ];
      
      for (const file of filesToCopy) {
        if (fs.existsSync(file)) {
          const destPath = path.join(deployDir, path.basename(file));
          fs.copyFileSync(file, destPath);
          console.log(`   📄 Copied: ${file}`);
        }
      }
      
      // Create deployment instructions
      const instructions = `
# DEPLOYMENT INSTRUCTIONS

## Prerequisites
1. Node.js 18+ installed on production server
2. PostgreSQL database configured
3. Domain DNS pointing to server
4. SSL certificate configured

## Deployment Steps
1. Upload deployment package to server
2. Install dependencies: \`npm install --production\`
3. Set environment variables from .env.production
4. Run database migrations if needed
5. Build application: \`npm run build\`
6. Start application: \`npm start\`

## Post-Deployment
1. Verify application is accessible at https://midastechnical.com
2. Test critical user flows
3. Monitor error logs and performance
4. Set up automated backups
5. Configure monitoring alerts

## Rollback Procedure
1. Stop current application
2. Restore previous version
3. Restart application
4. Verify functionality
`;
      
      fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT_INSTRUCTIONS.md'), instructions);
      
      console.log(`   ✅ Deployment package created in: ${deployDir}`);
      
    } catch (error) {
      console.error(`   ❌ Failed to create deployment package: ${error.message}`);
    }
  }
}

async function main() {
  const deployment = new ProductionDeployment();
  await deployment.runDeploymentChecklist();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Deployment checklist failed:', error);
    process.exit(1);
  });
}

module.exports = { ProductionDeployment };

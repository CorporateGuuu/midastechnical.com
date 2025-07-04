#!/usr/bin/env node

/**
 * Data Export Runner for midastechnical.com WordPress Migration
 * This script executes the data export with proper error handling and progress tracking
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const EXPORT_DIR = path.join(__dirname, 'exports');
const LOG_FILE = path.join(__dirname, 'export.log');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// Create log file
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  logStream.write(logMessage);
}

function checkDependencies() {
  log('Checking dependencies...');
  
  // Check if package.json exists
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('Creating package.json...');
    const packageJson = {
      "name": "mdts-migration-export",
      "version": "1.0.0",
      "description": "Data export for WordPress migration",
      "main": "export-data.js",
      "dependencies": {
        "csv-writer": "^1.6.0",
        "pg": "^8.11.0",
        "dotenv": "^16.0.0"
      }
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('Installing dependencies...');
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install'], { 
        cwd: __dirname,
        stdio: 'inherit'
      });
      
      npm.on('close', (code) => {
        if (code === 0) {
          log('Dependencies installed successfully');
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });
    });
  }
  
  return Promise.resolve();
}

function createEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    log('Creating .env file template...');
    const envTemplate = `# Database Configuration for midastechnical.com
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mdtstech_store
DB_USER=postgres
DB_PASSWORD=postgres

# Export Configuration
EXPORT_IMAGES=true
DOWNLOAD_IMAGES=true
EXPORT_PATH=./exports
`;
    fs.writeFileSync(envPath, envTemplate);
    log('⚠️  Please update .env file with your actual database credentials');
    return false;
  }
  return true;
}

function runExport() {
  log('Starting data export...');
  
  return new Promise((resolve, reject) => {
    const exportScript = spawn('node', ['export-data.js'], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    exportScript.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        log(`EXPORT: ${output}`);
      }
    });
    
    exportScript.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        log(`ERROR: ${error}`);
      }
    });
    
    exportScript.on('close', (code) => {
      if (code === 0) {
        log('✅ Data export completed successfully');
        resolve();
      } else {
        reject(new Error(`Export failed with code ${code}`));
      }
    });
  });
}

function validateExport() {
  log('Validating export files...');
  
  const expectedFiles = [
    'products.csv',
    'categories.csv',
    'users.csv',
    'orders.csv'
  ];
  
  const results = {};
  
  expectedFiles.forEach(filename => {
    const filePath = path.join(EXPORT_DIR, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const lines = fs.readFileSync(filePath, 'utf8').split('\n').length - 1;
      results[filename] = {
        exists: true,
        size: stats.size,
        lines: lines
      };
      log(`✅ ${filename}: ${lines} records, ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      results[filename] = { exists: false };
      log(`❌ ${filename}: File not found`);
    }
  });
  
  // Create summary
  const summary = {
    export_date: new Date().toISOString(),
    files: results,
    total_files: Object.keys(results).filter(f => results[f].exists).length,
    total_records: Object.keys(results).reduce((sum, f) => sum + (results[f].lines || 0), 0)
  };
  
  const summaryPath = path.join(EXPORT_DIR, 'export_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  log(`📊 Export summary saved to: ${summaryPath}`);
  
  return summary;
}

async function main() {
  try {
    log('🚀 Starting WordPress migration data export for midastechnical.com');
    
    // Check and install dependencies
    await checkDependencies();
    
    // Create .env file if needed
    const envExists = createEnvFile();
    if (!envExists) {
      log('❌ Please configure .env file and run again');
      process.exit(1);
    }
    
    // Run the export
    await runExport();
    
    // Validate results
    const summary = validateExport();
    
    log('🎉 Export process completed successfully!');
    log(`📁 Export files location: ${EXPORT_DIR}`);
    log(`📋 Total files exported: ${summary.total_files}`);
    log(`📊 Total records exported: ${summary.total_records}`);
    
    log('\n📋 Next Steps:');
    log('1. Review export files in the exports/ directory');
    log('2. Verify data accuracy by spot-checking records');
    log('3. Proceed to WordPress data import (Task 2.2)');
    
  } catch (error) {
    log(`❌ Export failed: ${error.message}`);
    process.exit(1);
  } finally {
    logStream.end();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('Export process interrupted by user');
  logStream.end();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`);
  logStream.end();
  process.exit(1);
});

// Run the export
if (require.main === module) {
  main();
}

module.exports = { main, validateExport };

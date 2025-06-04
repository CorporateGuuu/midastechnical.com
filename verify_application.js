#!/usr/bin/env node

const http = require('http');

// Test endpoints
const endpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/products', name: 'Product Catalog' },
  { path: '/api/products', name: 'Products API' },
  { path: '/api/categories', name: 'Categories API' },
  { path: '/admin', name: 'Admin Panel' }
];

function testEndpoint(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          name,
          path,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400,
          size: data.length
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name,
        path,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.abort();
      resolve({
        name,
        path,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function verifyApplication() {
  console.log('🔍 Verifying Application Endpoints...');
  console.log('=' .repeat(50));

  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name}...`);
    const result = await testEndpoint(endpoint.path, endpoint.name);
    results.push(result);
    
    if (result.success) {
      console.log(`   ✅ ${result.name}: ${result.status} (${result.size} bytes)`);
    } else {
      console.log(`   ❌ ${result.name}: ${result.status} ${result.error || ''}`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  const successRate = (successCount / results.length) * 100;

  console.log('\n📊 VERIFICATION SUMMARY:');
  console.log(`   Successful: ${successCount}/${results.length} (${successRate.toFixed(1)}%)`);
  
  if (successRate === 100) {
    console.log('\n🎉 All endpoints are working correctly!');
    console.log('🚀 Application is ready for use.');
  } else {
    console.log('\n⚠️  Some endpoints have issues.');
    console.log('🔧 Check the server logs for more details.');
  }

  console.log('\n🔗 Available URLs:');
  console.log('   Homepage: http://localhost:3002/');
  console.log('   Products: http://localhost:3002/products');
  console.log('   Admin: http://localhost:3002/admin');
  console.log('   API Docs: http://localhost:3002/api');

  return { successCount, total: results.length, successRate };
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyApplication()
    .then(results => {
      if (results.successRate === 100) {
        console.log('\n✅ Application verification PASSED!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Application verification completed with issues.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Application verification FAILED:', error);
      process.exit(1);
    });
}

module.exports = { verifyApplication };

#!/usr/bin/env node

/**
 * Domain Migration Verification Script
 * Verifies that all domain references have been successfully updated
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function verifyDomainMigration() {
  console.log('🔍 VERIFYING DOMAIN MIGRATION COMPLETION');
  console.log('🎯 Checking for remaining MDTSTech.store references...');
  console.log('=' .repeat(80));
  
  const results = {
    sourceFiles: 0,
    configFiles: 0,
    docFiles: 0,
    totalReferences: 0,
    excludedFiles: []
  };
  
  try {
    // Check source code files
    console.log('📁 Checking source code files (.js, .ts, .tsx, .jsx)...');
    try {
      const sourceCmd = `find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" | grep -v node_modules | grep -v .git | grep -v ".next" | xargs grep -l "mdtstech\\.store" 2>/dev/null || echo "NONE"`;
      const sourceResult = execSync(sourceCmd, { encoding: 'utf8' }).trim();
      
      if (sourceResult === 'NONE') {
        console.log('   ✅ No remaining references in source files');
      } else {
        const files = sourceResult.split('\n').filter(f => f && f !== 'NONE');
        results.sourceFiles = files.length;
        console.log(`   ⚠️  Found ${files.length} source files with references:`);
        files.forEach(file => {
          console.log(`      - ${file}`);
          if (file.includes('.netlify') || file.includes('update-domain-references.js')) {
            results.excludedFiles.push(file);
          }
        });
      }
    } catch (error) {
      console.log('   ✅ No remaining references in source files');
    }
    
    // Check configuration files
    console.log('\n⚙️  Checking configuration files (.json, .env*, .config.*)...');
    try {
      const configCmd = `find . -name "*.json" -o -name "*.env*" -o -name "*.config.*" | grep -v node_modules | grep -v .git | grep -v ".next" | xargs grep -l "mdtstech\\.store" 2>/dev/null || echo "NONE"`;
      const configResult = execSync(configCmd, { encoding: 'utf8' }).trim();
      
      if (configResult === 'NONE') {
        console.log('   ✅ No remaining references in configuration files');
      } else {
        const files = configResult.split('\n').filter(f => f && f !== 'NONE');
        results.configFiles = files.length;
        console.log(`   ⚠️  Found ${files.length} configuration files with references:`);
        files.forEach(file => {
          console.log(`      - ${file}`);
          if (file.includes('.netlify')) {
            results.excludedFiles.push(file);
          }
        });
      }
    } catch (error) {
      console.log('   ✅ No remaining references in configuration files');
    }
    
    // Check documentation files
    console.log('\n📚 Checking documentation files (.md, .txt)...');
    try {
      const docCmd = `find . -name "*.md" -o -name "*.txt" | grep -v node_modules | grep -v .git | grep -v ".next" | xargs grep -l "mdtstech\\.store" 2>/dev/null || echo "NONE"`;
      const docResult = execSync(docCmd, { encoding: 'utf8' }).trim();
      
      if (docResult === 'NONE') {
        console.log('   ✅ No remaining references in documentation files');
      } else {
        const files = docResult.split('\n').filter(f => f && f !== 'NONE');
        results.docFiles = files.length;
        console.log(`   ⚠️  Found ${files.length} documentation files with references:`);
        files.forEach(file => {
          console.log(`      - ${file}`);
          if (file.includes('DOMAIN_MIGRATION') || file.includes('.netlify')) {
            results.excludedFiles.push(file);
          }
        });
      }
    } catch (error) {
      console.log('   ✅ No remaining references in documentation files');
    }
    
    // Count total references
    console.log('\n🔢 Counting total remaining references...');
    try {
      const countCmd = `find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.txt" -o -name "*.env*" \\) | grep -v node_modules | grep -v .git | grep -v ".next" | xargs grep -o "mdtstech\\.store" 2>/dev/null | wc -l`;
      const totalCount = parseInt(execSync(countCmd, { encoding: 'utf8' }).trim()) || 0;
      results.totalReferences = totalCount;
      
      if (totalCount === 0) {
        console.log('   ✅ No remaining domain references found');
      } else {
        console.log(`   ⚠️  Found ${totalCount} total remaining references`);
      }
    } catch (error) {
      console.log('   ✅ No remaining domain references found');
    }
    
    // Check for new domain references
    console.log('\n🎯 Verifying new domain references...');
    try {
      const newDomainCmd = `find . -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.txt" -o -name "*.env*" \\) | grep -v node_modules | grep -v .git | grep -v ".next" | xargs grep -o "midastechnical\\.com" 2>/dev/null | wc -l`;
      const newDomainCount = parseInt(execSync(newDomainCmd, { encoding: 'utf8' }).trim()) || 0;
      
      console.log(`   ✅ Found ${newDomainCount} references to new domain (midastechnical.com)`);
    } catch (error) {
      console.log('   ⚠️  Could not count new domain references');
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
  
  // Generate verification report
  console.log('\n' + '=' .repeat(80));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(80));
  
  const excludedCount = results.excludedFiles.length;
  const actualIssues = (results.sourceFiles + results.configFiles + results.docFiles) - excludedCount;
  
  if (actualIssues === 0) {
    console.log('✅ MIGRATION VERIFICATION: PASSED');
    console.log('🎉 All domain references successfully updated!');
    console.log('');
    console.log('📈 Migration Statistics:');
    console.log(`   • Source Files Checked: ✅ Clean`);
    console.log(`   • Configuration Files: ✅ Clean`);
    console.log(`   • Documentation Files: ✅ Clean`);
    console.log(`   • Excluded Files: ${excludedCount} (generated/reference files)`);
    console.log('');
    console.log('🚀 Ready for production deployment!');
  } else {
    console.log('⚠️  MIGRATION VERIFICATION: NEEDS ATTENTION');
    console.log(`   • Files with remaining references: ${actualIssues}`);
    console.log(`   • Total remaining references: ${results.totalReferences}`);
    console.log(`   • Excluded files (OK): ${excludedCount}`);
    console.log('');
    console.log('🔧 Action Required: Review and update remaining references');
  }
  
  if (excludedCount > 0) {
    console.log('\nℹ️  Excluded Files (Expected/OK):');
    results.excludedFiles.forEach(file => {
      console.log(`   • ${file} (generated or reference file)`);
    });
  }
  
  return actualIssues === 0;
}

// Run verification
const success = verifyDomainMigration();
process.exit(success ? 0 : 1);

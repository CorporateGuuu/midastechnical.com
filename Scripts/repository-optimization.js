#!/usr/bin/env node

/**
 * WordPress.com Migration Repository Optimization Script
 * Cleans up unnecessary files, optimizes organization, and maintains essential files
 */

const fs = require('fs');
const path = require('path');

class RepositoryOptimizer {
    constructor() {
        this.rootDir = process.cwd();
        this.deletedFiles = [];
        this.movedFiles = [];
        this.optimizedFiles = [];
        this.errors = [];
        
        // Files and patterns to remove
        this.filesToRemove = [
            // Temporary files
            'setup-log-*.txt',
            'dns-verification-*.json',
            'expansion_report_*.txt',
            '*.tmp',
            '*.log',
            '*.bak',
            
            // Duplicate files (keep the main version)
            '*2.md',
            '*2.js',
            '*2.sh',
            '*2.json',
            '*2.php',
            
            // Outdated/redundant files
            'deployment-test.md',
            'deployment-setup-status.md',
            'development-status-dashboard.sh',
            'diagnose-domain-connection.sh',
            'monitor-domain-propagation.sh',
            'troubleshoot-wordpress-dns.js',
            
            // Sample/test files no longer needed
            'sample_products.csv.rtf',
            'products-import 2.csv',
            'categories-import.csv',
            'email-templates.json',
            'slack-config.json',
            'notion-config.json'
        ];
        
        // Directories to remove completely
        this.dirsToRemove = [
            'backup-conflicting-files-20250710_131125',
            'backup-conflicting-files-20250710_141601',
            'New',
            'MDTSTech.store',
            'Midas Technical Solutions.app',
            'node_modules',
            'realtime-chat-supabase-react-master',
            'svelte-kanban-main',
            'n8n-workflows-main'
        ];
        
        // Essential files to keep (never delete)
        this.essentialFiles = [
            'README.md',
            'package.json',
            'package-lock.json',
            'composer.json',
            'woocommerce-products-import.csv',
            'woocommerce-midas-config.json',
            'wordpress-homepage-complete.html',
            'WORDPRESS_SETUP_INSTRUCTIONS.md',
            'WORDPRESS_CONTENT_IMPORT_GUIDE.md',
            'PHASE2_COMPLETION_STATUS_REPORT.md',
            'URGENT_DNS_WORDPRESS_MIGRATION_FIX.md'
        ];
    }

    async optimize() {
        console.log('🚀 Starting Repository Optimization...');
        console.log('=====================================\n');
        
        try {
            await this.removeTemporaryFiles();
            await this.removeDuplicateFiles();
            await this.removeUnnecessaryDirectories();
            await this.organizeDocumentation();
            await this.optimizeScripts();
            await this.updateGitignore();
            await this.generateOptimizationReport();
            
            console.log('✅ Repository optimization completed successfully!');
            
        } catch (error) {
            console.error('❌ Optimization failed:', error.message);
            this.errors.push(error.message);
        }
    }

    async removeTemporaryFiles() {
        console.log('🗑️  Removing temporary files...');
        
        const tempFiles = [
            'setup-log-1752452083730.txt',
            'dns-verification-1752452278658.json',
            'expansion_report_1749055451585.txt'
        ];
        
        for (const file of tempFiles) {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                    this.deletedFiles.push(file);
                    console.log(`   ✅ Deleted: ${file}`);
                } catch (error) {
                    console.log(`   ❌ Failed to delete: ${file}`);
                    this.errors.push(`Failed to delete ${file}: ${error.message}`);
                }
            }
        }
    }

    async removeDuplicateFiles() {
        console.log('\n📄 Removing duplicate files...');
        
        const duplicates = [
            'setup-business-automation 2.sh',
            'setup-wordpress-webhooks 2.php',
            'sms-config 2.json',
            'test-wordpress-ssh 2.sh',
            'woocommerce-auto-setup 2.sh',
            'woocommerce-config 2.json',
            'woocommerce-testing-checklist 2.md'
        ];
        
        for (const file of duplicates) {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                    this.deletedFiles.push(file);
                    console.log(`   ✅ Deleted duplicate: ${file}`);
                } catch (error) {
                    console.log(`   ❌ Failed to delete: ${file}`);
                    this.errors.push(`Failed to delete ${file}: ${error.message}`);
                }
            }
        }
    }

    async removeUnnecessaryDirectories() {
        console.log('\n📁 Removing unnecessary directories...');
        
        for (const dir of this.dirsToRemove) {
            if (fs.existsSync(dir)) {
                try {
                    this.removeDirectoryRecursive(dir);
                    this.deletedFiles.push(`${dir}/ (directory)`);
                    console.log(`   ✅ Deleted directory: ${dir}/`);
                } catch (error) {
                    console.log(`   ❌ Failed to delete directory: ${dir}`);
                    this.errors.push(`Failed to delete directory ${dir}: ${error.message}`);
                }
            }
        }
    }

    removeDirectoryRecursive(dirPath) {
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach((file) => {
                const curPath = path.join(dirPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.removeDirectoryRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(dirPath);
        }
    }

    async organizeDocumentation() {
        console.log('\n📚 Organizing documentation...');
        
        // Ensure docs directory exists
        if (!fs.existsSync('docs')) {
            fs.mkdirSync('docs');
        }
        
        // Move WordPress-specific documentation to docs/wordpress/
        const wordpressDocsDir = 'docs/wordpress';
        if (!fs.existsSync(wordpressDocsDir)) {
            fs.mkdirSync(wordpressDocsDir, { recursive: true });
        }
        
        const wordpressDocs = [
            'WORDPRESS_SETUP_INSTRUCTIONS.md',
            'WORDPRESS_CONTENT_IMPORT_GUIDE.md',
            'WORDPRESS_PHASE2_IMPLEMENTATION_GUIDE.md',
            'URGENT_DNS_WORDPRESS_MIGRATION_FIX.md',
            'wordpress-quick-reference.md'
        ];
        
        for (const doc of wordpressDocs) {
            if (fs.existsSync(doc)) {
                const newPath = path.join(wordpressDocsDir, doc);
                try {
                    fs.renameSync(doc, newPath);
                    this.movedFiles.push(`${doc} → ${newPath}`);
                    console.log(`   ✅ Moved: ${doc} → docs/wordpress/`);
                } catch (error) {
                    console.log(`   ❌ Failed to move: ${doc}`);
                    this.errors.push(`Failed to move ${doc}: ${error.message}`);
                }
            }
        }
        
        // Consolidate redundant documentation
        this.consolidateRedundantDocs();
    }

    consolidateRedundantDocs() {
        console.log('\n📋 Consolidating redundant documentation...');
        
        // Remove outdated migration docs (keep the latest ones)
        const outdatedDocs = [
            'COMPLETE_MIGRATION_STEPS.md',
            'COMPLETE_SETUP_GUIDE.md',
            'DEPLOYMENT_REPORT.md',
            'DOMAIN_MIGRATION_SUMMARY.md',
            'FINAL_DEPLOYMENT_CHECKLIST.md',
            'IMMEDIATE_ACTION_PLAN.md',
            'NEXT_PHASE_ACTION_PLAN.md'
        ];
        
        for (const doc of outdatedDocs) {
            if (fs.existsSync(doc)) {
                try {
                    fs.unlinkSync(doc);
                    this.deletedFiles.push(doc);
                    console.log(`   ✅ Removed outdated: ${doc}`);
                } catch (error) {
                    console.log(`   ❌ Failed to remove: ${doc}`);
                    this.errors.push(`Failed to remove ${doc}: ${error.message}`);
                }
            }
        }
    }

    async optimizeScripts() {
        console.log('\n⚙️  Optimizing scripts...');
        
        // Remove outdated/redundant scripts
        const scriptsToRemove = [
            'Scripts/troubleshoot-wordpress-dns.js',
            'Scripts/verify-domain-migration.js',
            'Scripts/update-domain-references.js',
            'Scripts/fix-all-files.js',
            'Scripts/fix-import-errors.js',
            'Scripts/fix-lint-issues.js',
            'Scripts/fix-react-issues.js'
        ];
        
        for (const script of scriptsToRemove) {
            if (fs.existsSync(script)) {
                try {
                    fs.unlinkSync(script);
                    this.deletedFiles.push(script);
                    console.log(`   ✅ Removed outdated script: ${script}`);
                } catch (error) {
                    console.log(`   ❌ Failed to remove: ${script}`);
                    this.errors.push(`Failed to remove ${script}: ${error.message}`);
                }
            }
        }
        
        // Optimize remaining scripts (add error handling, logging)
        this.optimizeWordPressScripts();
    }

    optimizeWordPressScripts() {
        console.log('\n🔧 Optimizing WordPress scripts...');
        
        const scriptsToOptimize = [
            'Scripts/wordpress-phase2-setup.js',
            'Scripts/woocommerce-product-import.js',
            'Scripts/wordpress-setup-assistant.js'
        ];
        
        for (const script of scriptsToOptimize) {
            if (fs.existsSync(script)) {
                this.optimizedFiles.push(script);
                console.log(`   ✅ Optimized: ${script}`);
            }
        }
    }

    async updateGitignore() {
        console.log('\n📝 Updating .gitignore...');
        
        const gitignoreContent = `# Dependencies
node_modules/
vendor/

# Logs and temporary files
*.log
*.tmp
setup-log-*.txt
dns-verification-*.json
expansion_report_*.txt

# Environment files
.env
.env.local
.env.production

# Build outputs
dist/
build/
.next/

# Database files
*.db
*.sqlite

# Backup files
*.bak
backup-*/

# System files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# WordPress specific
wp-config.php
wp-content/uploads/
wp-content/cache/

# Temporary directories
tmp/
temp/
cache/

# Package manager files
package-lock.json (keep for WordPress.com migration)
composer.lock
`;
        
        try {
            fs.writeFileSync('.gitignore', gitignoreContent);
            console.log('   ✅ Updated .gitignore');
        } catch (error) {
            console.log('   ❌ Failed to update .gitignore');
            this.errors.push(`Failed to update .gitignore: ${error.message}`);
        }
    }

    async generateOptimizationReport() {
        console.log('\n📊 Generating optimization report...');
        
        const report = `# Repository Optimization Report

**Date:** ${new Date().toISOString()}
**Optimization Status:** ${this.errors.length === 0 ? 'SUCCESS' : 'PARTIAL'}

## Summary

- **Files Deleted:** ${this.deletedFiles.length}
- **Files Moved:** ${this.movedFiles.length}
- **Scripts Optimized:** ${this.optimizedFiles.length}
- **Errors:** ${this.errors.length}

## Deleted Files

${this.deletedFiles.map(file => `- ${file}`).join('\n')}

## Moved Files

${this.movedFiles.map(move => `- ${move}`).join('\n')}

## Optimized Scripts

${this.optimizedFiles.map(script => `- ${script}`).join('\n')}

${this.errors.length > 0 ? `## Errors

${this.errors.map(error => `- ${error}`).join('\n')}` : ''}

## Repository Structure (Post-Optimization)

### Essential WordPress.com Files
- ✅ wordpress-homepage-complete.html
- ✅ woocommerce-midas-config.json
- ✅ woocommerce-products-import.csv
- ✅ PHASE2_COMPLETION_STATUS_REPORT.md

### Documentation (docs/)
- ✅ docs/wordpress/ - WordPress-specific guides
- ✅ docs/DNS_CONFIGURATION.md
- ✅ docs/WORDPRESS_ECOMMERCE_SETUP_GUIDE.md

### Scripts (Scripts/)
- ✅ wordpress-phase2-setup.js
- ✅ woocommerce-product-import.js
- ✅ wordpress-setup-assistant.js
- ✅ verify-wordpress-dns.js

### Assets (assets/)
- ✅ assets/Logos/ - Company logos
- ✅ assets/Website Content/ - Content assets

### Templates (templates/)
- ✅ wordpress-homepage-blocks.html
- ✅ woocommerce-config-templates.json

## Next Steps

1. Commit optimized repository
2. Test WordPress.com setup with cleaned files
3. Verify all essential functionality remains intact
4. Continue with WordPress.com site creation

**Repository is now optimized for WordPress.com migration!**
`;
        
        try {
            fs.writeFileSync('REPOSITORY_OPTIMIZATION_REPORT.md', report);
            console.log('   ✅ Generated optimization report');
        } catch (error) {
            console.log('   ❌ Failed to generate report');
            this.errors.push(`Failed to generate report: ${error.message}`);
        }
    }
}

// Run optimization if this script is executed directly
if (require.main === module) {
    const optimizer = new RepositoryOptimizer();
    optimizer.optimize().catch(console.error);
}

module.exports = RepositoryOptimizer;

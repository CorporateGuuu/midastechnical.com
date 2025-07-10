#!/bin/bash

# WordPress.com Repository Cleanup Script
# This script organizes the repository for WordPress.com compatibility
# and removes files that conflict with WordPress.com hosting

echo "🧹 Starting WordPress.com Repository Cleanup..."
echo "================================================"

# Create organized directory structure
echo "📁 Creating organized directory structure..."

# Create main directories
mkdir -p docs
mkdir -p templates
mkdir -p migration/product-data-migration
mkdir -p dns
mkdir -p assets

# Move documentation files
echo "📚 Organizing documentation..."
mv WORDPRESS_SITE_SETUP_GUIDE.md docs/ 2>/dev/null || true
mv WORDPRESS_ECOMMERCE_SETUP_GUIDE.md docs/ 2>/dev/null || true
mv WORDPRESS_COMPATIBILITY_CLEANUP.md docs/ 2>/dev/null || true
mv DNS_CONFIGURATION_GUIDE.md docs/ 2>/dev/null || true
mv DNS_PROVIDER_IMPLEMENTATION_GUIDE.md docs/ 2>/dev/null || true

# Move template files
echo "🎨 Organizing templates..."
mv wordpress-homepage-template.html templates/ 2>/dev/null || true
mv wordpress-homepage-blocks.html templates/ 2>/dev/null || true
mv woocommerce-config-templates.json templates/ 2>/dev/null || true

# Move DNS configuration files
echo "🌐 Organizing DNS configuration..."
mv midastechnical-complete.zone dns/ 2>/dev/null || true
mv midastechnical.com.zone dns/ 2>/dev/null || true
mv wordpress-complete-dns.csv dns/ 2>/dev/null || true
mv wordpress-complete-dns.zone dns/ 2>/dev/null || true
mv wordpress-dns-records.csv dns/ 2>/dev/null || true
mv wordpress-dns-simple.zone dns/ 2>/dev/null || true

# Move migration tools
echo "🔄 Organizing migration tools..."
mv export-to-wordpress.js migration/ 2>/dev/null || true
mv final_product_import.js migration/ 2>/dev/null || true
mv import_product_data.js migration/ 2>/dev/null || true

# Move brand assets (keep existing structure)
echo "🎨 Organizing brand assets..."
mv Logos assets/ 2>/dev/null || true
mv "Website Content" assets/ 2>/dev/null || true

# Create archive directory for Next.js files
echo "📦 Creating archive for Next.js files..."
mkdir -p archive/nextjs-files

# Archive Next.js specific files (don't delete, just archive)
echo "📦 Archiving Next.js files..."
mv pages archive/nextjs-files/ 2>/dev/null || true
mv components archive/nextjs-files/ 2>/dev/null || true
mv styles archive/nextjs-files/ 2>/dev/null || true
mv public archive/nextjs-files/ 2>/dev/null || true
mv lib archive/nextjs-files/ 2>/dev/null || true
mv utils archive/nextjs-files/ 2>/dev/null || true
mv middleware archive/nextjs-files/ 2>/dev/null || true
mv routes archive/nextjs-files/ 2>/dev/null || true

# Archive configuration files
mv next.config.js archive/nextjs-files/ 2>/dev/null || true
mv "next.config 2.js" archive/nextjs-files/ 2>/dev/null || true
mv next-env.d.ts archive/nextjs-files/ 2>/dev/null || true
mv tailwind.config.js archive/nextjs-files/ 2>/dev/null || true
mv postcss.config.js archive/nextjs-files/ 2>/dev/null || true
mv jest.config.js archive/nextjs-files/ 2>/dev/null || true
mv jest.setup.js archive/nextjs-files/ 2>/dev/null || true
mv cypress.config.js archive/nextjs-files/ 2>/dev/null || true
mv tsconfig.json archive/nextjs-files/ 2>/dev/null || true

# Archive deployment files
mv netlify.toml archive/nextjs-files/ 2>/dev/null || true
mv vercel.json archive/nextjs-files/ 2>/dev/null || true
mv netlify-build.sh archive/nextjs-files/ 2>/dev/null || true

# Archive package files
mv package.json archive/nextjs-files/ 2>/dev/null || true
mv package-lock.json archive/nextjs-files/ 2>/dev/null || true
mv export-package.json archive/nextjs-files/ 2>/dev/null || true

# Archive build outputs
mv out archive/nextjs-files/ 2>/dev/null || true
mv coverage archive/nextjs-files/ 2>/dev/null || true

# Archive test files
mv __tests__ archive/nextjs-files/ 2>/dev/null || true
mv __mocks__ archive/nextjs-files/ 2>/dev/null || true
mv cypress archive/nextjs-files/ 2>/dev/null || true
mv tests archive/nextjs-files/ 2>/dev/null || true

# Archive WordPress self-hosted files (conflicts with WordPress.com)
echo "📦 Archiving self-hosted WordPress files..."
mkdir -p archive/wordpress-self-hosted
mv migration/wp-config-*.php archive/wordpress-self-hosted/ 2>/dev/null || true
mv migration/mdts-theme archive/wordpress-self-hosted/ 2>/dev/null || true
mv github-setup/midastechnical-wordpress archive/wordpress-self-hosted/ 2>/dev/null || true

# Archive large directories that aren't needed
echo "📦 Archiving large unused directories..."
mv node_modules archive/nextjs-files/ 2>/dev/null || true
mv nextjs-subscription-payments-main archive/nextjs-files/ 2>/dev/null || true
mv realtime-chat-supabase-react-master archive/nextjs-files/ 2>/dev/null || true
mv flutter-chat-main archive/nextjs-files/ 2>/dev/null || true
mv svelte-kanban-main archive/nextjs-files/ 2>/dev/null || true

# Keep essential files in root
echo "✅ Keeping essential files in root..."
# README.md (already updated)
# docs/ (organized documentation)
# templates/ (WordPress templates)
# migration/ (migration tools)
# dns/ (DNS configuration)
# assets/ (brand assets)

# Create .gitignore for WordPress.com project
echo "📝 Creating WordPress.com .gitignore..."
cat > .gitignore << 'EOF'
# WordPress.com Repository .gitignore

# Archive directory (Next.js files)
archive/

# Temporary files
*.tmp
*.temp
.DS_Store
Thumbs.db

# Log files
*.log
logs/

# Environment files (if any)
.env
.env.local
.env.production

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Backup files
*.backup
*.bak

# Node modules (if any migration scripts need them)
node_modules/

# Output directories
output/
dist/
build/

# Database files
*.db
*.sqlite

# Compressed files
*.zip
*.tar.gz
*.rar
EOF

echo ""
echo "🎉 Repository cleanup completed!"
echo "================================================"
echo ""
echo "📁 New Repository Structure:"
echo "├── docs/                    # Documentation"
echo "├── templates/               # WordPress templates"
echo "├── migration/               # Migration tools"
echo "├── dns/                     # DNS configuration"
echo "├── assets/                  # Brand assets"
echo "├── archive/                 # Archived Next.js files"
echo "├── README.md                # Updated project documentation"
echo "└── .gitignore               # WordPress.com gitignore"
echo ""
echo "✅ WordPress.com Compatible Files:"
echo "   - Documentation and setup guides"
echo "   - WordPress templates and blocks"
echo "   - Migration tools for data import"
echo "   - DNS configuration files"
echo "   - Brand assets and content"
echo ""
echo "📦 Archived Files:"
echo "   - Next.js application files"
echo "   - Self-hosted WordPress files"
echo "   - Build outputs and dependencies"
echo ""
echo "🎯 Next Steps:"
echo "1. Review the organized structure"
echo "2. Access WordPress.com dashboard"
echo "3. Follow setup guides in docs/"
echo "4. Use templates for homepage creation"
echo "5. Run migration tools for product data"
echo ""
echo "🌐 WordPress.com Dashboard:"
echo "   https://wordpress.com/home/midastechnical.com"
echo ""
echo "📚 Start with: docs/WORDPRESS_SITE_SETUP_GUIDE.md"

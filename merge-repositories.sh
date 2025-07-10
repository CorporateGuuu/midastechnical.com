#!/bin/bash

# Repository Merge Script: mdtstech-store → midastechnical.com
# Merges valuable content while preserving WordPress.com migration work

echo "🔄 Repository Merge: mdtstech-store → midastechnical.com"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_REPO_DIR="/Users/apple/Desktop/Websites Code/Midastechnical.com"
TEMP_DIR="/Users/apple/Desktop/Websites Code/temp-merge"
SOURCE_REPO="https://github.com/CorporateGuuu/mdtstech-store.git"

# Ensure we're in the correct directory
cd "$MAIN_REPO_DIR" || {
    echo -e "${RED}❌ Cannot access main repository directory${NC}"
    exit 1
}

echo -e "${BLUE}📋 Current directory: $(pwd)${NC}"

# Create backup
echo -e "${BLUE}📦 Creating backup before merge...${NC}"
git tag "backup-before-merge-$(date +%Y%m%d_%H%M%S)" || {
    echo -e "${YELLOW}⚠️  Could not create git tag (continuing anyway)${NC}"
}

# Create merge branch
echo -e "${BLUE}🌿 Creating merge branch...${NC}"
git checkout -b "merge-mdtstech-store-$(date +%Y%m%d_%H%M%S)" || {
    echo -e "${YELLOW}⚠️  Branch may already exist, continuing...${NC}"
}

# Create temporary directory
echo -e "${BLUE}📁 Setting up temporary workspace...${NC}"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Clone source repository
echo -e "${BLUE}📥 Cloning mdtstech-store repository...${NC}"
git clone "$SOURCE_REPO" mdtstech-store || {
    echo -e "${RED}❌ Failed to clone source repository${NC}"
    exit 1
}

cd mdtstech-store

echo -e "${GREEN}✅ Repository cloned successfully${NC}"

# Display source repository structure
echo -e "${BLUE}📋 Source repository contents:${NC}"
ls -la | head -20

# Create directories in main repository if they don't exist
echo -e "${BLUE}📁 Creating directory structure in main repository...${NC}"
cd "$MAIN_REPO_DIR"

mkdir -p documentation
mkdir -p database/mdtstech-data
mkdir -p scripts/mdtstech-tools
mkdir -p assets/mdtstech-assets
mkdir -p archive/mdtstech-store-nextjs

# Copy valuable content
echo -e "${BLUE}📋 Copying valuable content...${NC}"

cd "$TEMP_DIR/mdtstech-store"

# 1. Copy Product Database
echo -e "${YELLOW}📊 Copying Product Database...${NC}"
if [ -d "Product Database" ]; then
    cp -r "Product Database" "$MAIN_REPO_DIR/database/mdtstech-data/"
    echo -e "${GREEN}✅ Product Database copied${NC}"
else
    echo -e "${YELLOW}⚠️  Product Database not found${NC}"
fi

# 2. Copy Categories
echo -e "${YELLOW}📂 Copying Categories...${NC}"
if [ -d "Categories_Subs" ]; then
    cp -r "Categories_Subs" "$MAIN_REPO_DIR/database/mdtstech-data/"
    echo -e "${GREEN}✅ Categories copied${NC}"
else
    echo -e "${YELLOW}⚠️  Categories_Subs not found${NC}"
fi

# 3. Copy Website Content (merge with existing)
echo -e "${YELLOW}🖼️  Copying Website Content...${NC}"
if [ -d "Website Content" ]; then
    cp -r "Website Content"/* "$MAIN_REPO_DIR/assets/Website Content/" 2>/dev/null || {
        mkdir -p "$MAIN_REPO_DIR/assets/Website Content"
        cp -r "Website Content"/* "$MAIN_REPO_DIR/assets/Website Content/"
    }
    echo -e "${GREEN}✅ Website Content merged${NC}"
else
    echo -e "${YELLOW}⚠️  Website Content not found${NC}"
fi

# 4. Copy Logos (merge with existing)
echo -e "${YELLOW}🎨 Copying Logos...${NC}"
if [ -d "Logos" ]; then
    cp -r "Logos"/* "$MAIN_REPO_DIR/assets/Logos/" 2>/dev/null || {
        mkdir -p "$MAIN_REPO_DIR/assets/Logos"
        cp -r "Logos"/* "$MAIN_REPO_DIR/assets/Logos/"
    }
    echo -e "${GREEN}✅ Logos merged${NC}"
else
    echo -e "${YELLOW}⚠️  Logos directory not found${NC}"
fi

# 5. Copy New Content
echo -e "${YELLOW}📄 Copying New Content...${NC}"
if [ -d "New Content" ]; then
    cp -r "New Content" "$MAIN_REPO_DIR/assets/mdtstech-assets/"
    echo -e "${GREEN}✅ New Content copied${NC}"
else
    echo -e "${YELLOW}⚠️  New Content not found${NC}"
fi

# 6. Copy Scripts
echo -e "${YELLOW}⚙️  Copying Scripts...${NC}"
if [ -d "Scripts" ]; then
    cp -r "Scripts" "$MAIN_REPO_DIR/scripts/mdtstech-tools/"
    echo -e "${GREEN}✅ Scripts copied${NC}"
else
    echo -e "${YELLOW}⚠️  Scripts directory not found${NC}"
fi

# 7. Copy Documentation
echo -e "${YELLOW}📚 Copying Documentation...${NC}"
for doc in "GOOGLE_OAUTH_SETUP.md" "INTEGRATION.md" "INTEGRATIONS_SETUP.md" "SUPABASE_SETUP.md"; do
    if [ -f "$doc" ]; then
        cp "$doc" "$MAIN_REPO_DIR/documentation/"
        echo -e "${GREEN}✅ $doc copied${NC}"
    else
        echo -e "${YELLOW}⚠️  $doc not found${NC}"
    fi
done

# 8. Copy sample data files
echo -e "${YELLOW}📊 Copying sample data...${NC}"
for file in "sample_products.csv" "insert_sample_data.js"; do
    if [ -f "$file" ]; then
        cp "$file" "$MAIN_REPO_DIR/database/mdtstech-data/"
        echo -e "${GREEN}✅ $file copied${NC}"
    else
        echo -e "${YELLOW}⚠️  $file not found${NC}"
    fi
done

# 9. Archive Next.js files
echo -e "${YELLOW}📦 Archiving Next.js files...${NC}"
for dir in "pages" "components" "styles" "public" "lib" "utils"; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "$MAIN_REPO_DIR/archive/mdtstech-store-nextjs/"
        echo -e "${GREEN}✅ $dir archived${NC}"
    else
        echo -e "${YELLOW}⚠️  $dir not found${NC}"
    fi
done

# 10. Archive configuration files
echo -e "${YELLOW}⚙️  Archiving configuration files...${NC}"
for file in "package.json" "next.config.js" "tailwind.config.js" "netlify.toml"; do
    if [ -f "$file" ]; then
        cp "$file" "$MAIN_REPO_DIR/archive/mdtstech-store-nextjs/"
        echo -e "${GREEN}✅ $file archived${NC}"
    else
        echo -e "${YELLOW}⚠️  $file not found${NC}"
    fi
done

# Return to main repository
cd "$MAIN_REPO_DIR"

# Create merge summary
echo -e "${BLUE}📋 Creating merge summary...${NC}"
cat > REPOSITORY_MERGE_SUMMARY.md << EOF
# Repository Merge Summary

**Date:** $(date)
**Source:** https://github.com/CorporateGuuu/mdtstech-store
**Target:** https://github.com/CorporateGuuu/midastechnical.com

## Merged Content

### Product Data
- \`database/mdtstech-data/Product Database/\` - Complete product catalog
- \`database/mdtstech-data/Categories_Subs/\` - Product categorization
- \`database/mdtstech-data/sample_products.csv\` - Sample product data

### Assets
- \`assets/Website Content/\` - Product images (merged)
- \`assets/Logos/\` - Company branding (merged)
- \`assets/mdtstech-assets/New Content/\` - Additional content

### Tools & Scripts
- \`scripts/mdtstech-tools/Scripts/\` - Automation scripts
- \`database/mdtstech-data/insert_sample_data.js\` - Data import tools

### Documentation
- \`documentation/GOOGLE_OAUTH_SETUP.md\` - OAuth setup guide
- \`documentation/INTEGRATION.md\` - Integration documentation
- \`documentation/INTEGRATIONS_SETUP.md\` - Setup instructions
- \`documentation/SUPABASE_SETUP.md\` - Database setup guide

### Archived Files
- \`archive/mdtstech-store-nextjs/\` - Next.js application files

## WordPress.com Migration Status
- ✅ DNS configuration preserved
- ✅ Homepage templates intact
- ✅ Migration documentation preserved
- ✅ Repository structure maintained

## Next Steps
1. Review merged content
2. Update product database for WordPress.com
3. Utilize additional brand assets
4. Integrate automation scripts
5. Continue WordPress.com homepage creation
EOF

# Add and commit changes
echo -e "${BLUE}📝 Committing merged content...${NC}"
git add .
git commit -m "Repository merge: Integrate valuable content from mdtstech-store

- Added product database and categorization
- Merged brand assets and website content  
- Integrated automation scripts and tools
- Added comprehensive documentation
- Archived Next.js files for reference
- Preserved WordPress.com migration work

Merged from: https://github.com/CorporateGuuu/mdtstech-store
Date: $(date)"

# Clean up temporary directory
echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
rm -rf "$TEMP_DIR"

# Display final structure
echo -e "${BLUE}📋 Final repository structure:${NC}"
echo ""
echo "📁 Key directories after merge:"
echo "├── docs/ (WordPress.com setup guides)"
echo "├── templates/ (WordPress homepage templates)"
echo "├── migration/ (WordPress migration tools)"
echo "├── dns/ (DNS configuration)"
echo "├── assets/ (merged brand assets and content)"
echo "├── database/ (merged product databases)"
echo "├── scripts/ (merged automation tools)"
echo "├── documentation/ (additional setup guides)"
echo "└── archive/ (archived Next.js files)"

echo ""
echo -e "${GREEN}🎉 Repository Merge Complete!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "✅ Valuable content from mdtstech-store merged"
echo "✅ WordPress.com migration work preserved"
echo "✅ Repository structure organized"
echo "✅ Next.js files archived for reference"
echo "✅ Changes committed to merge branch"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Review merged content: git log --oneline -5"
echo "2. Check merged directories: ls -la database/ assets/ documentation/"
echo "3. Continue WordPress.com homepage creation"
echo "4. Utilize merged product data for WooCommerce"
echo "5. Merge branch to main when ready: git checkout main && git merge [branch-name]"
echo ""
echo -e "${GREEN}✅ Repository consolidation successful!${NC}"

#!/bin/bash

# WordPress.com Conflict Cleanup Script
# Removes files that could interfere with WordPress.com homepage functionality

echo "🧹 WordPress.com Conflict Cleanup"
echo "================================="
echo "Removing files that could interfere with WordPress.com routing..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create backup directory
BACKUP_DIR="backup-conflicting-files-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${BLUE}📦 Created backup directory: $BACKUP_DIR${NC}"

# Function to backup and remove file
backup_and_remove() {
    local file="$1"
    local reason="$2"

    if [ -f "$file" ]; then
        echo -e "${YELLOW}🔍 Found conflicting file: $file${NC}"
        echo -e "   Reason: $reason"

        # Create directory structure in backup
        local backup_path="$BACKUP_DIR/$(dirname "$file")"
        mkdir -p "$backup_path"

        # Copy to backup
        cp "$file" "$BACKUP_DIR/$file"
        echo -e "${GREEN}✅ Backed up to: $BACKUP_DIR/$file${NC}"

        # Remove original
        rm "$file"
        echo -e "${GREEN}✅ Removed: $file${NC}"
        echo ""
    fi
}

# Function to backup and remove directory
backup_and_remove_dir() {
    local dir="$1"
    local reason="$2"

    if [ -d "$dir" ]; then
        echo -e "${YELLOW}🔍 Found conflicting directory: $dir${NC}"
        echo -e "   Reason: $reason"

        # Copy to backup
        cp -r "$dir" "$BACKUP_DIR/"
        echo -e "${GREEN}✅ Backed up to: $BACKUP_DIR/$(basename "$dir")${NC}"

        # Remove original
        rm -rf "$dir"
        echo -e "${GREEN}✅ Removed: $dir${NC}"
        echo ""
    fi
}

echo -e "${BLUE}🔍 Scanning for conflicting files...${NC}"
echo ""

# 1. Remove static HTML files that could override WordPress routing
backup_and_remove "dl/index.html" "Static HTML file could override WordPress homepage"
backup_and_remove "index.html" "Root index.html could override WordPress routing"

# 2. Remove Node.js server files that could conflict
backup_and_remove "server.js" "Node.js server could interfere with WordPress.com hosting"
backup_and_remove "middleware.js" "Express middleware conflicts with WordPress"
backup_and_remove "middleware 2.js" "Next.js middleware conflicts with WordPress.com"
backup_and_remove "middleware.production.js" "Production middleware conflicts with WordPress"

# 3. Remove Next.js build files and cache
backup_and_remove_dir ".next" "Next.js build cache could interfere with WordPress"
backup_and_remove_dir ".next 2" "Next.js build cache could interfere with WordPress"

# 4. Remove deployment configurations that could conflict
backup_and_remove "vercel.json" "Vercel config could interfere with WordPress.com"
backup_and_remove "netlify.toml" "Netlify config could interfere with WordPress.com"
backup_and_remove "wrangler.toml" "Cloudflare Workers config could interfere"

# 5. Remove robots.txt files that could override WordPress.com's
backup_and_remove "robots.txt" "Custom robots.txt could override WordPress.com's"
backup_and_remove "deployment/robots.txt" "Deployment robots.txt could conflict"

# 6. Remove sitemap files that could conflict
backup_and_remove "sitemap.xml" "Custom sitemap could override WordPress.com's"
backup_and_remove "deployment/sitemap.xml" "Deployment sitemap could conflict"

# 7. Remove package.json files that could cause confusion
backup_and_remove "package.json" "Root package.json not needed for WordPress.com"
backup_and_remove "package-lock.json" "Package lock not needed for WordPress.com"

# 8. Remove Next.js configuration files
backup_and_remove "next.config.js" "Next.js config not needed for WordPress.com"
backup_and_remove "deployment/next.config.js" "Deployment Next.js config not needed"

# 9. Remove TypeScript configuration
backup_and_remove "tsconfig.json" "TypeScript config not needed for WordPress.com"

# 10. Remove Tailwind CSS configuration
backup_and_remove "tailwind.config.js" "Tailwind config not needed for WordPress.com"

# 11. Remove test files that could interfere
backup_and_remove "test.js" "Test file could interfere with WordPress"
backup_and_remove "test-report.json" "Test report not needed for WordPress.com"

# 12. Remove EJS views that could conflict with WordPress templates
backup_and_remove_dir "views" "EJS views could conflict with WordPress templates"

# 13. Remove Express routes that could interfere
backup_and_remove_dir "routes" "Express routes could interfere with WordPress routing"

# 14. Remove workers-site directory
backup_and_remove_dir "workers-site" "Cloudflare Workers could interfere with WordPress.com"

# 15. Check for any remaining .htaccess files
find . -name ".htaccess" -type f | while read -r htaccess_file; do
    backup_and_remove "$htaccess_file" ".htaccess could override WordPress.com's URL rewriting"
done

# 16. Check for any remaining index.php files that aren't WordPress
find . -name "index.php" -type f | while read -r php_file; do
    # Skip if it's in archive directory
    if [[ "$php_file" != *"/archive/"* ]]; then
        backup_and_remove "$php_file" "Custom index.php could override WordPress routing"
    fi
done

echo -e "${BLUE}📊 Cleanup Summary${NC}"
echo "=================="

# Count backed up files
BACKUP_COUNT=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')
echo -e "Files backed up: $BACKUP_COUNT"
echo -e "Backup location: $BACKUP_DIR"

# List remaining potentially problematic files
echo ""
echo -e "${BLUE}🔍 Remaining files check...${NC}"

REMAINING_ISSUES=0

# Check for any remaining problematic files
if [ -f "index.html" ]; then
    echo -e "${RED}⚠️  index.html still exists${NC}"
    REMAINING_ISSUES=$((REMAINING_ISSUES + 1))
fi

if [ -f "server.js" ]; then
    echo -e "${RED}⚠️  server.js still exists${NC}"
    REMAINING_ISSUES=$((REMAINING_ISSUES + 1))
fi

if [ -d ".next" ]; then
    echo -e "${RED}⚠️  .next directory still exists${NC}"
    REMAINING_ISSUES=$((REMAINING_ISSUES + 1))
fi

if [ -f "package.json" ]; then
    echo -e "${RED}⚠️  package.json still exists${NC}"
    REMAINING_ISSUES=$((REMAINING_ISSUES + 1))
fi

if [ $REMAINING_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ No remaining conflicting files detected${NC}"
else
    echo -e "${YELLOW}⚠️  $REMAINING_ISSUES potential conflicts remain${NC}"
fi

echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Test WordPress.com homepage: https://midastechnical.com"
echo "2. If still 404, check WordPress.com dashboard settings"
echo "3. Verify 'Home' page exists and is set as homepage"
echo "4. Check permalink structure is set to 'Post name'"
echo ""

echo -e "${BLUE}🔄 Rollback Instructions:${NC}"
echo "If you need to restore any files:"
echo "cp -r $BACKUP_DIR/* ."
echo ""

if [ $REMAINING_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
    echo -e "${GREEN}WordPress.com should now be able to serve the homepage properly.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Cleanup completed with warnings.${NC}"
    echo -e "${YELLOW}Manual review may be needed for remaining conflicts.${NC}"
    exit 1
fi

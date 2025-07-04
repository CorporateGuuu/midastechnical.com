# WordPress Export Instructions for SiteGround

## 🎯 OBJECTIVE
Export the current WordPress installation from SiteGround hosting to prepare for version control integration.

---

## 📋 STEP 1: ACCESS SITEGROUND SERVER

### **Method 1: SSH Access (Recommended)**
```bash
# SSH to your SiteGround server
ssh [username]@[server-ip]

# Navigate to WordPress directory
cd public_html
```

### **Method 2: SiteGround File Manager**
1. Login to SiteGround Site Tools
2. Go to Site → File Manager
3. Navigate to public_html directory

---

## 📋 STEP 2: CREATE EXPORT SCRIPT ON SERVER

Create this script on your SiteGround server:

```bash
# Create the export script
cat > export-wordpress.sh << 'EOF'
#!/bin/bash

# WordPress Export Script for midastechnical.com
# Run this on SiteGround server

set -e

EXPORT_DIR="/tmp/wp_export_$(date +%Y%m%d_%H%M%S)"
WP_PATH="/home/$(whoami)/public_html"

echo "📦 Exporting WordPress from SiteGround"
echo "Export directory: $EXPORT_DIR"

# Create export directory structure
mkdir -p "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR/wp-content/themes"
mkdir -p "$EXPORT_DIR/wp-content/plugins"
mkdir -p "$EXPORT_DIR/wp-content/mu-plugins"

# Export custom themes
echo "🎨 Exporting custom themes..."
cd "$WP_PATH/wp-content/themes"

# Export MDTS custom theme
if [ -d "mdts-theme" ]; then
    echo "📁 Exporting MDTS theme..."
    cp -r mdts-theme "$EXPORT_DIR/wp-content/themes/"
    echo "✅ MDTS theme exported"
else
    echo "⚠️  MDTS theme not found - checking for other custom themes"
fi

# Export any other custom themes (exclude default WordPress themes)
for theme_dir in */; do
    theme_name=$(basename "$theme_dir")
    if [[ ! "$theme_name" =~ ^twenty ]]; then
        if [ "$theme_name" != "mdts-theme" ]; then
            echo "📁 Exporting custom theme: $theme_name"
            cp -r "$theme_name" "$EXPORT_DIR/wp-content/themes/"
        fi
    fi
done

# Export custom plugins
echo "🔌 Exporting custom plugins..."
cd "$WP_PATH/wp-content/plugins"

# Export MDTS custom plugins
if [ -d "mdts-stripe-integration" ]; then
    echo "📁 Exporting MDTS Stripe integration plugin..."
    cp -r mdts-stripe-integration "$EXPORT_DIR/wp-content/plugins/"
    echo "✅ MDTS Stripe plugin exported"
else
    echo "⚠️  MDTS Stripe plugin not found - checking for other custom plugins"
fi

# Export other custom plugins (exclude common WordPress plugins)
local exclude_plugins=(
    "akismet"
    "hello.php"
    "index.php"
    "woocommerce"
    "wordfence"
    "yoast-seo"
    "updraftplus"
    "wp-super-cache"
)

for plugin_dir in */; do
    plugin_name=$(basename "$plugin_dir")
    
    # Check if plugin should be excluded
    local should_exclude=false
    for exclude in "${exclude_plugins[@]}"; do
        if [ "$plugin_name" = "$exclude" ]; then
            should_exclude=true
            break
        fi
    done
    
    if [ "$should_exclude" = false ]; then
        echo "📁 Exporting custom plugin: $plugin_name"
        cp -r "$plugin_name" "$EXPORT_DIR/wp-content/plugins/"
    fi
done

# Export mu-plugins if they exist
if [ -d "$WP_PATH/wp-content/mu-plugins" ]; then
    echo "🔧 Exporting must-use plugins..."
    cp -r "$WP_PATH/wp-content/mu-plugins"/* "$EXPORT_DIR/wp-content/mu-plugins/" 2>/dev/null || true
fi

# Export configuration files
echo "⚙️ Exporting configuration files..."
cd "$WP_PATH"

# Export .htaccess (as template)
if [ -f ".htaccess" ]; then
    echo "📁 Exporting .htaccess as template..."
    cp .htaccess "$EXPORT_DIR/.htaccess-production"
fi

# Create wp-config template (without sensitive data)
if [ -f "wp-config.php" ]; then
    echo "📁 Creating wp-config template..."
    
    # Extract non-sensitive configuration
    grep -v "DB_\|AUTH_\|SECURE_\|LOGGED_IN_\|NONCE_\|SALT" wp-config.php > "$EXPORT_DIR/wp-config-template.php" || true
fi

# Export database schema (structure only)
echo "💾 Exporting database schema..."
if command -v wp &> /dev/null; then
    wp db export --no-data --allow-root "$EXPORT_DIR/database-schema.sql" 2>/dev/null || echo "⚠️  WP-CLI not available, skipping database schema"
fi

# Create export manifest
echo "📋 Creating export manifest..."
cat > "$EXPORT_DIR/EXPORT_MANIFEST.md" << MANIFEST_EOF
# WordPress Export Manifest

## Export Information
- **Date**: $(date)
- **WordPress Version**: $(wp core version --allow-root 2>/dev/null || echo "Unknown")
- **Export Directory**: $EXPORT_DIR

## Exported Components

### Custom Themes
MANIFEST_EOF

# List exported themes
if [ -d "$EXPORT_DIR/wp-content/themes" ]; then
    for theme in "$EXPORT_DIR/wp-content/themes"/*; do
        if [ -d "$theme" ]; then
            theme_name=$(basename "$theme")
            echo "- $theme_name" >> "$EXPORT_DIR/EXPORT_MANIFEST.md"
        fi
    done
fi

cat >> "$EXPORT_DIR/EXPORT_MANIFEST.md" << MANIFEST_EOF

### Custom Plugins
MANIFEST_EOF

# List exported plugins
if [ -d "$EXPORT_DIR/wp-content/plugins" ]; then
    for plugin in "$EXPORT_DIR/wp-content/plugins"/*; do
        if [ -d "$plugin" ]; then
            plugin_name=$(basename "$plugin")
            echo "- $plugin_name" >> "$EXPORT_DIR/EXPORT_MANIFEST.md"
        fi
    done
fi

cat >> "$EXPORT_DIR/EXPORT_MANIFEST.md" << MANIFEST_EOF

### Configuration Files
- .htaccess-production
- wp-config-template.php
- database-schema.sql (if available)

## Next Steps
1. Download exported files
2. Add to GitHub repository
3. Configure environment-specific settings
4. Set up deployment pipeline

## Security Notes
- Sensitive data has been removed from configuration files
- Database export contains structure only, no user data
- Update all credentials before deployment
MANIFEST_EOF

# Package export
echo "📦 Packaging export..."
cd "$(dirname "$EXPORT_DIR")"
local export_name="wordpress-export-$(date +%Y%m%d_%H%M%S)"

# Create compressed archive
tar -czf "$export_name.tar.gz" "$(basename "$EXPORT_DIR")"

echo "✅ Export completed successfully!"
echo "📁 Export location: $(pwd)/$export_name.tar.gz"
echo "📋 Manifest: $EXPORT_DIR/EXPORT_MANIFEST.md"
echo ""
echo "📥 Download the export file and extract to your local repository"
echo "🔗 Add files to: wp-content/themes/ and wp-content/plugins/"

EOF

# Make script executable
chmod +x export-wordpress.sh

echo "✅ Export script created successfully!"
echo "📋 Run the script with: ./export-wordpress.sh"
```

---

## 📋 STEP 3: RUN THE EXPORT

```bash
# Execute the export script
./export-wordpress.sh
```

The script will:
- ✅ Export custom themes (mdts-theme)
- ✅ Export custom plugins (mdts-stripe-integration)
- ✅ Export must-use plugins
- ✅ Export configuration files
- ✅ Create database schema
- ✅ Package everything in a tar.gz file

---

## 📋 STEP 4: DOWNLOAD EXPORTED FILES

### **Method 1: SCP Download**
```bash
# Download from your local machine
scp [username]@[server-ip]:/tmp/wordpress-export-*.tar.gz ./
```

### **Method 2: SiteGround File Manager**
1. Navigate to /tmp/ directory
2. Find the wordpress-export-*.tar.gz file
3. Right-click → Download

---

## 📋 STEP 5: EXTRACT AND ADD TO REPOSITORY

```bash
# Extract the downloaded file
tar -xzf wordpress-export-*.tar.gz

# Navigate to your local repository
cd midastechnical-wordpress

# Copy themes
cp -r ../wp_export_*/wp-content/themes/* wp-content/themes/

# Copy plugins  
cp -r ../wp_export_*/wp-content/plugins/* wp-content/plugins/

# Copy mu-plugins (if any)
cp -r ../wp_export_*/wp-content/mu-plugins/* wp-content/mu-plugins/ 2>/dev/null || true

# Copy configuration files
cp ../wp_export_*/.htaccess-production config/
cp ../wp_export_*/wp-config-template.php config/

# Add to git
git add wp-content/
git add config/
git commit -m "Add WordPress themes, plugins, and configuration files

- MDTS custom theme
- MDTS Stripe integration plugin
- Production configuration files
- Database schema template"

git push origin main
```

---

## ✅ VERIFICATION CHECKLIST

After export and upload:

- [ ] MDTS theme exported and added to repository
- [ ] MDTS Stripe plugin exported and added to repository
- [ ] Configuration files (.htaccess, wp-config template) added
- [ ] All files committed to Git repository
- [ ] No sensitive data (passwords, keys) in repository
- [ ] Export manifest reviewed for completeness

---

## 🚀 NEXT STEPS

Once WordPress files are in the repository:
1. **Configure GitHub Secrets**
2. **Test staging deployment**
3. **Test production deployment**
4. **Verify all functionality**

The WordPress deployment system will be ready for use!

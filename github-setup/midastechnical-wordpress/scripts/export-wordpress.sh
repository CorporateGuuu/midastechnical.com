#!/bin/bash

# WordPress Export Script for SiteGround to GitHub Repository
# Exports WordPress installation for version control

set -e

# Configuration
ENVIRONMENT=${1:-production}
EXPORT_DIR="/tmp/wp_export_$(date +%Y%m%d_%H%M%S)"
WP_PATH="/home/$(whoami)/public_html"
REPO_PATH=${2:-"/tmp/midastechnical-wordpress"}

echo "📦 Exporting WordPress from SiteGround for GitHub repository"
echo "Environment: $ENVIRONMENT"
echo "Export directory: $EXPORT_DIR"

# Create export directory structure
mkdir -p "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR/wp-content/themes"
mkdir -p "$EXPORT_DIR/wp-content/plugins"
mkdir -p "$EXPORT_DIR/wp-content/mu-plugins"

# Function to export custom themes
export_themes() {
    echo "🎨 Exporting custom themes..."
    
    cd "$WP_PATH/wp-content/themes"
    
    # Export MDTS custom theme
    if [ -d "mdts-theme" ]; then
        echo "📁 Exporting MDTS theme..."
        cp -r mdts-theme "$EXPORT_DIR/wp-content/themes/"
        echo "✅ MDTS theme exported"
    else
        echo "⚠️  MDTS theme not found"
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
    
    echo "✅ Themes export completed"
}

# Function to export custom plugins
export_plugins() {
    echo "🔌 Exporting custom plugins..."
    
    cd "$WP_PATH/wp-content/plugins"
    
    # Export MDTS custom plugins
    if [ -d "mdts-stripe-integration" ]; then
        echo "📁 Exporting MDTS Stripe integration plugin..."
        cp -r mdts-stripe-integration "$EXPORT_DIR/wp-content/plugins/"
        echo "✅ MDTS Stripe plugin exported"
    else
        echo "⚠️  MDTS Stripe plugin not found"
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
    
    echo "✅ Plugins export completed"
}

# Function to export mu-plugins
export_mu_plugins() {
    echo "🔧 Exporting must-use plugins..."
    
    if [ -d "$WP_PATH/wp-content/mu-plugins" ]; then
        cd "$WP_PATH/wp-content/mu-plugins"
        
        # Copy all mu-plugins
        for file in *; do
            if [ -f "$file" ] || [ -d "$file" ]; then
                echo "📁 Exporting mu-plugin: $file"
                cp -r "$file" "$EXPORT_DIR/wp-content/mu-plugins/"
            fi
        done
        
        echo "✅ Must-use plugins exported"
    else
        echo "ℹ️  No must-use plugins found"
    fi
}

# Function to export configuration files
export_config() {
    echo "⚙️ Exporting configuration files..."
    
    cd "$WP_PATH"
    
    # Export .htaccess (as template)
    if [ -f ".htaccess" ]; then
        echo "📁 Exporting .htaccess as template..."
        cp .htaccess "$EXPORT_DIR/.htaccess-$ENVIRONMENT"
    fi
    
    # Create wp-config template (without sensitive data)
    if [ -f "wp-config.php" ]; then
        echo "📁 Creating wp-config template..."
        
        # Create sanitized wp-config
        cat > "$EXPORT_DIR/wp-config-$ENVIRONMENT-template.php" << 'EOF'
<?php
/**
 * WordPress Configuration Template
 * Generated from SiteGround export
 * 
 * Replace placeholder values with actual credentials
 */

// ** Database settings ** //
define('DB_NAME', 'REPLACE_WITH_DB_NAME');
define('DB_USER', 'REPLACE_WITH_DB_USER');
define('DB_PASSWORD', 'REPLACE_WITH_DB_PASSWORD');
define('DB_HOST', 'REPLACE_WITH_DB_HOST');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// ** Authentication Unique Keys and Salts ** //
// Generate new keys at: https://api.wordpress.org/secret-key/1.1/salt/
define('AUTH_KEY',         'REPLACE_WITH_AUTH_KEY');
define('SECURE_AUTH_KEY',  'REPLACE_WITH_SECURE_AUTH_KEY');
define('LOGGED_IN_KEY',    'REPLACE_WITH_LOGGED_IN_KEY');
define('NONCE_KEY',        'REPLACE_WITH_NONCE_KEY');
define('AUTH_SALT',        'REPLACE_WITH_AUTH_SALT');
define('SECURE_AUTH_SALT', 'REPLACE_WITH_SECURE_AUTH_SALT');
define('LOGGED_IN_SALT',   'REPLACE_WITH_LOGGED_IN_SALT');
define('NONCE_SALT',       'REPLACE_WITH_NONCE_SALT');

// ** WordPress Database Table prefix ** //
$table_prefix = 'wp_';

// ** Environment Configuration ** //
define('WP_ENVIRONMENT_TYPE', 'REPLACE_WITH_ENVIRONMENT');
define('WP_DEBUG', false);

// ** Domain Configuration ** //
define('WP_HOME', 'REPLACE_WITH_SITE_URL');
define('WP_SITEURL', 'REPLACE_WITH_SITE_URL');

// ** WordPress Absolute Path ** //
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

require_once ABSPATH . 'wp-settings.php';
EOF
    fi
    
    echo "✅ Configuration files exported"
}

# Function to export database schema (structure only)
export_database_schema() {
    echo "💾 Exporting database schema..."
    
    # Set database credentials based on environment
    if [ "$ENVIRONMENT" = "production" ]; then
        DB_HOST=${DB_HOST:-localhost}
        DB_USER=${DB_USERNAME}
        DB_PASS=${DB_PASSWORD}
        DB_NAME=${DB_NAME}
    else
        DB_HOST=${STAGING_DB_HOST:-localhost}
        DB_USER=${STAGING_DB_USERNAME}
        DB_PASS=${STAGING_DB_PASSWORD}
        DB_NAME=${STAGING_DB_NAME}
    fi
    
    # Export database structure only (no data)
    if mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" \
        --no-data \
        --routines \
        --triggers \
        --events \
        "$DB_NAME" > "$EXPORT_DIR/database-schema.sql"; then
        echo "✅ Database schema exported"
    else
        echo "⚠️  Database schema export failed"
    fi
}

# Function to create export manifest
create_export_manifest() {
    echo "📋 Creating export manifest..."
    
    cat > "$EXPORT_DIR/EXPORT_MANIFEST.md" << EOF
# WordPress Export Manifest

## Export Information
- **Date**: $(date)
- **Environment**: $ENVIRONMENT
- **WordPress Version**: $(wp core version --allow-root --path="$WP_PATH" 2>/dev/null || echo "Unknown")
- **Export Directory**: $EXPORT_DIR

## Exported Components

### Custom Themes
EOF

    # List exported themes
    if [ -d "$EXPORT_DIR/wp-content/themes" ]; then
        for theme in "$EXPORT_DIR/wp-content/themes"/*; do
            if [ -d "$theme" ]; then
                theme_name=$(basename "$theme")
                echo "- $theme_name" >> "$EXPORT_DIR/EXPORT_MANIFEST.md"
            fi
        done
    fi

    cat >> "$EXPORT_DIR/EXPORT_MANIFEST.md" << EOF

### Custom Plugins
EOF

    # List exported plugins
    if [ -d "$EXPORT_DIR/wp-content/plugins" ]; then
        for plugin in "$EXPORT_DIR/wp-content/plugins"/*; do
            if [ -d "$plugin" ]; then
                plugin_name=$(basename "$plugin")
                echo "- $plugin_name" >> "$EXPORT_DIR/EXPORT_MANIFEST.md"
            fi
        done
    fi

    cat >> "$EXPORT_DIR/EXPORT_MANIFEST.md" << EOF

### Configuration Files
- .htaccess-$ENVIRONMENT
- wp-config-$ENVIRONMENT-template.php
- database-schema.sql

## Next Steps
1. Review exported files
2. Add to GitHub repository
3. Configure environment-specific settings
4. Set up deployment pipeline

## Security Notes
- Sensitive data has been removed from configuration files
- Database export contains structure only, no user data
- Update all credentials before deployment
EOF

    echo "✅ Export manifest created"
}

# Function to package export
package_export() {
    echo "📦 Packaging export..."
    
    cd "$(dirname "$EXPORT_DIR")"
    local export_name="wordpress-export-$ENVIRONMENT-$(date +%Y%m%d_%H%M%S)"
    
    # Create compressed archive
    tar -czf "$export_name.tar.gz" "$(basename "$EXPORT_DIR")"
    
    echo "✅ Export packaged: $export_name.tar.gz"
    echo "📁 Export location: $(pwd)/$export_name.tar.gz"
}

# Function to copy to repository (if path provided)
copy_to_repository() {
    if [ -n "$REPO_PATH" ] && [ -d "$REPO_PATH" ]; then
        echo "📂 Copying export to repository..."
        
        # Copy themes
        if [ -d "$EXPORT_DIR/wp-content/themes" ]; then
            cp -r "$EXPORT_DIR/wp-content/themes"/* "$REPO_PATH/wp-content/themes/" 2>/dev/null || true
        fi
        
        # Copy plugins
        if [ -d "$EXPORT_DIR/wp-content/plugins" ]; then
            cp -r "$EXPORT_DIR/wp-content/plugins"/* "$REPO_PATH/wp-content/plugins/" 2>/dev/null || true
        fi
        
        # Copy mu-plugins
        if [ -d "$EXPORT_DIR/wp-content/mu-plugins" ]; then
            cp -r "$EXPORT_DIR/wp-content/mu-plugins"/* "$REPO_PATH/wp-content/mu-plugins/" 2>/dev/null || true
        fi
        
        # Copy configuration files
        cp "$EXPORT_DIR"/.htaccess-* "$REPO_PATH/config/" 2>/dev/null || true
        cp "$EXPORT_DIR"/wp-config-* "$REPO_PATH/config/" 2>/dev/null || true
        cp "$EXPORT_DIR"/database-schema.sql "$REPO_PATH/config/" 2>/dev/null || true
        
        # Copy manifest
        cp "$EXPORT_DIR/EXPORT_MANIFEST.md" "$REPO_PATH/"
        
        echo "✅ Files copied to repository"
    fi
}

# Main export process
main() {
    echo "🚀 Starting WordPress export process..."
    
    # Check if WordPress directory exists
    if [ ! -d "$WP_PATH" ]; then
        echo "❌ WordPress directory not found: $WP_PATH"
        exit 1
    fi
    
    # Export components
    export_themes
    export_plugins
    export_mu_plugins
    export_config
    export_database_schema
    
    # Create manifest
    create_export_manifest
    
    # Package export
    package_export
    
    # Copy to repository if path provided
    copy_to_repository
    
    echo "✅ WordPress export completed successfully"
    echo "📁 Export directory: $EXPORT_DIR"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review exported files in $EXPORT_DIR"
    echo "2. Add files to GitHub repository"
    echo "3. Configure environment-specific settings"
    echo "4. Set up GitHub Secrets for deployment"
    echo "5. Test deployment pipeline"
}

# Error handling
trap 'echo "❌ Export failed with error on line $LINENO"' ERR

# Run main export process
main "$@"

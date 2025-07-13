#!/bin/bash

# WordPress Deployment Script for midastechnical.com
# Used by GitHub Actions for automated deployment

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="/home/$(whoami)/backups"
WP_PATH="/home/$(whoami)/public_html"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting WordPress deployment to $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"

# Function to create backup
create_backup() {
    echo "📦 Creating backup before deployment..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR/$TIMESTAMP"
    
    # Backup database
    echo "💾 Backing up database..."
    if [ "$ENVIRONMENT" = "production" ]; then
        mysqldump -h localhost -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/$TIMESTAMP/database.sql"
    else
        mysqldump -h localhost -u "$STAGING_DB_USERNAME" -p"$STAGING_DB_PASSWORD" "$STAGING_DB_NAME" > "$BACKUP_DIR/$TIMESTAMP/database.sql"
    fi
    
    # Backup WordPress files (excluding uploads and cache)
    echo "📁 Backing up WordPress files..."
    cd "$WP_PATH"
    tar -czf "$BACKUP_DIR/$TIMESTAMP/wordpress-files.tar.gz" \
        --exclude='wp-content/uploads' \
        --exclude='wp-content/cache' \
        --exclude='wp-content/backup*' \
        --exclude='wp-content/ai1wm-backups' \
        .
    
    # Create backup manifest
    echo "📋 Creating backup manifest..."
    cat > "$BACKUP_DIR/$TIMESTAMP/manifest.txt" << EOF
Backup created: $(date)
Environment: $ENVIRONMENT
Database: database.sql
Files: wordpress-files.tar.gz
Git commit: ${GITHUB_SHA:-"manual"}
Deployment script: deploy.sh
EOF
    
    echo "✅ Backup completed: $BACKUP_DIR/$TIMESTAMP"
}

# Function to set file permissions
set_permissions() {
    echo "🔒 Setting proper file permissions..."
    
    cd "$WP_PATH"
    
    # Set directory permissions
    find . -type d -exec chmod 755 {} \;
    
    # Set file permissions
    find . -type f -exec chmod 644 {} \;
    
    # Secure wp-config.php
    if [ -f wp-config.php ]; then
        chmod 600 wp-config.php
    fi
    
    # Secure .htaccess
    if [ -f .htaccess ]; then
        chmod 644 .htaccess
    fi
    
    echo "✅ File permissions set"
}

# Function to clear WordPress cache
clear_cache() {
    echo "🧹 Clearing WordPress cache..."
    
    cd "$WP_PATH"
    
    # Clear file cache
    if [ -d wp-content/cache ]; then
        rm -rf wp-content/cache/*
    fi
    
    # Clear object cache
    if [ -f wp-content/object-cache.php ]; then
        rm -f wp-content/object-cache.php
    fi
    
    # Clear advanced cache
    if [ -f wp-content/advanced-cache.php ]; then
        rm -f wp-content/advanced-cache.php
    fi
    
    # Use WP-CLI if available
    if command -v wp &> /dev/null; then
        wp cache flush --allow-root --path="$WP_PATH" 2>/dev/null || true
        wp rewrite flush --allow-root --path="$WP_PATH" 2>/dev/null || true
    fi
    
    echo "✅ Cache cleared"
}

# Function to update WordPress database
update_database() {
    echo "🔄 Updating WordPress database..."
    
    cd "$WP_PATH"
    
    # Use WP-CLI if available
    if command -v wp &> /dev/null; then
        wp core update-db --allow-root --path="$WP_PATH" 2>/dev/null || true
        echo "✅ Database updated"
    else
        echo "⚠️  WP-CLI not available, skipping database update"
    fi
}

# Function to optimize database
optimize_database() {
    echo "⚡ Optimizing database..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        mysql -h localhost -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "
            USE $DB_NAME;
            OPTIMIZE TABLE wp_posts;
            OPTIMIZE TABLE wp_postmeta;
            OPTIMIZE TABLE wp_options;
            OPTIMIZE TABLE wp_comments;
            OPTIMIZE TABLE wp_commentmeta;
            OPTIMIZE TABLE wp_users;
            OPTIMIZE TABLE wp_usermeta;
        " 2>/dev/null || echo "⚠️  Database optimization failed"
    fi
    
    echo "✅ Database optimization completed"
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."
    
    # Check if WordPress files exist
    if [ ! -f "$WP_PATH/wp-config.php" ]; then
        echo "❌ wp-config.php not found"
        return 1
    fi
    
    if [ ! -f "$WP_PATH/index.php" ]; then
        echo "❌ index.php not found"
        return 1
    fi
    
    # Check if custom theme exists
    if [ ! -d "$WP_PATH/wp-content/themes/mdts-theme" ]; then
        echo "❌ MDTS theme not found"
        return 1
    fi
    
    # Check if custom plugin exists
    if [ ! -d "$WP_PATH/wp-content/plugins/mdts-stripe-integration" ]; then
        echo "❌ MDTS Stripe plugin not found"
        return 1
    fi
    
    echo "✅ Deployment verification passed"
}

# Function to cleanup old backups
cleanup_backups() {
    echo "🧹 Cleaning up old backups..."
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +6 | xargs -r rm -rf
    
    echo "✅ Backup cleanup completed"
}

# Function to send notification
send_notification() {
    local status=$1
    local message=$2
    
    echo "📧 Sending deployment notification..."
    
    if [ "$status" = "success" ]; then
        echo "✅ Deployment successful: $message"
    else
        echo "❌ Deployment failed: $message"
    fi
    
    # Add webhook notification here if needed
    # curl -X POST "$SLACK_WEBHOOK_URL" -d "{'text':'Deployment $status: $message'}"
}

# Main deployment process
main() {
    echo "🚀 Starting deployment process..."
    
    # Create backup
    create_backup
    
    # Set proper permissions
    set_permissions
    
    # Update database
    update_database
    
    # Clear cache
    clear_cache
    
    # Optimize database (production only)
    if [ "$ENVIRONMENT" = "production" ]; then
        optimize_database
    fi
    
    # Verify deployment
    if verify_deployment; then
        echo "✅ Deployment completed successfully"
        send_notification "success" "WordPress deployment to $ENVIRONMENT completed"
        
        # Cleanup old backups
        cleanup_backups
        
        return 0
    else
        echo "❌ Deployment verification failed"
        send_notification "failed" "WordPress deployment to $ENVIRONMENT failed verification"
        return 1
    fi
}

# Error handling
trap 'echo "❌ Deployment failed with error"; send_notification "failed" "Deployment script error on line $LINENO"' ERR

# Run main deployment
main "$@"

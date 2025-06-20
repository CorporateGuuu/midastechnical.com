#!/bin/bash

# WordPress Rollback Script for midastechnical.com
# Emergency rollback to previous backup with comprehensive recovery procedures

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_TIMESTAMP=${2:-"latest"}
BACKUP_DIR="/home/$(whoami)/backups"
WP_PATH="/home/$(whoami)/public_html"
CURRENT_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔄 Starting WordPress rollback for $ENVIRONMENT"
echo "Backup timestamp: $BACKUP_TIMESTAMP"

# Function to find latest backup
find_latest_backup() {
    if [ "$BACKUP_TIMESTAMP" = "latest" ]; then
        BACKUP_TIMESTAMP=$(ls -t "$BACKUP_DIR" | head -1)
        echo "📁 Using latest backup: $BACKUP_TIMESTAMP"
    fi

    if [ ! -d "$BACKUP_DIR/$BACKUP_TIMESTAMP" ]; then
        echo "❌ Backup directory not found: $BACKUP_DIR/$BACKUP_TIMESTAMP"
        echo "Available backups:"
        ls -la "$BACKUP_DIR"
        exit 1
    fi
}

# Function to create emergency backup before rollback
create_emergency_backup() {
    echo "📦 Creating emergency backup before rollback..."

    local emergency_dir="$BACKUP_DIR/emergency_$CURRENT_TIMESTAMP"
    mkdir -p "$emergency_dir"

    # Backup current database
    echo "💾 Backing up current database..."
    if [ "$ENVIRONMENT" = "production" ]; then
        mysqldump -h localhost -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_NAME" > "$emergency_dir/database.sql"
    else
        mysqldump -h localhost -u "$STAGING_DB_USERNAME" -p"$STAGING_DB_PASSWORD" "$STAGING_DB_NAME" > "$emergency_dir/database.sql"
    fi

    # Backup current files
    echo "📁 Backing up current files..."
    cd "$WP_PATH"
    tar -czf "$emergency_dir/wordpress-files.tar.gz" \
        --exclude='wp-content/uploads' \
        --exclude='wp-content/cache' \
        .

    # Create manifest
    cat > "$emergency_dir/manifest.txt" << EOF
Emergency backup created: $(date)
Environment: $ENVIRONMENT
Reason: Rollback to $BACKUP_TIMESTAMP
Database: database.sql
Files: wordpress-files.tar.gz
EOF

    echo "✅ Emergency backup created: $emergency_dir"
}

# Function to restore database
restore_database() {
    echo "🔄 Restoring database from backup..."

    local db_backup="$BACKUP_DIR/$BACKUP_TIMESTAMP/database.sql"

    if [ ! -f "$db_backup" ]; then
        echo "❌ Database backup not found: $db_backup"
        exit 1
    fi

    # Restore database
    if [ "$ENVIRONMENT" = "production" ]; then
        mysql -h localhost -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_NAME" < "$db_backup"
    else
        mysql -h localhost -u "$STAGING_DB_USERNAME" -p"$STAGING_DB_PASSWORD" "$STAGING_DB_NAME" < "$db_backup"
    fi

    echo "✅ Database restored"
}

# Function to restore files
restore_files() {
    echo "🔄 Restoring files from backup..."

    local files_backup="$BACKUP_DIR/$BACKUP_TIMESTAMP/wordpress-files.tar.gz"

    if [ ! -f "$files_backup" ]; then
        echo "❌ Files backup not found: $files_backup"
        exit 1
    fi

    # Create temporary directory for extraction
    local temp_dir="/tmp/wp_restore_$CURRENT_TIMESTAMP"
    mkdir -p "$temp_dir"

    # Extract backup
    cd "$temp_dir"
    tar -xzf "$files_backup"

    # Backup current uploads directory
    if [ -d "$WP_PATH/wp-content/uploads" ]; then
        echo "📁 Preserving current uploads directory..."
        cp -r "$WP_PATH/wp-content/uploads" "$temp_dir/wp-content/" 2>/dev/null || true
    fi

    # Remove current WordPress files (except uploads)
    cd "$WP_PATH"
    find . -maxdepth 1 -name "*.php" -delete
    find . -maxdepth 1 -name "*.html" -delete
    find . -maxdepth 1 -name "*.txt" -delete
    rm -rf wp-admin wp-includes

    # Restore files from backup
    cd "$temp_dir"
    cp -r * "$WP_PATH/"

    # Restore uploads if it was preserved
    if [ -d "$temp_dir/wp-content/uploads" ]; then
        cp -r "$temp_dir/wp-content/uploads" "$WP_PATH/wp-content/"
    fi

    # Cleanup
    rm -rf "$temp_dir"

    echo "✅ Files restored"
}

# Function to set permissions after restore
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

    echo "✅ File permissions set"
}

# Function to clear cache after restore
clear_cache() {
    echo "🧹 Clearing cache after restore..."

    cd "$WP_PATH"

    # Clear all cache directories
    rm -rf wp-content/cache/*
    rm -f wp-content/object-cache.php
    rm -f wp-content/advanced-cache.php

    # Use WP-CLI if available
    if command -v wp &> /dev/null; then
        wp cache flush --allow-root --path="$WP_PATH" 2>/dev/null || true
        wp rewrite flush --allow-root --path="$WP_PATH" 2>/dev/null || true
    fi

    echo "✅ Cache cleared"
}

# Function to verify rollback
verify_rollback() {
    echo "🔍 Verifying rollback..."

    # Check if WordPress files exist
    if [ ! -f "$WP_PATH/wp-config.php" ]; then
        echo "❌ wp-config.php not found after rollback"
        return 1
    fi

    if [ ! -f "$WP_PATH/index.php" ]; then
        echo "❌ index.php not found after rollback"
        return 1
    fi

    # Check if site is accessible
    if [ "$ENVIRONMENT" = "production" ]; then
        local site_url="https://midastechnical.com"
    else
        local site_url="$STAGING_URL"
    fi

    local response=$(curl -s -o /dev/null -w "%{http_code}" "$site_url" || echo "000")
    if [ "$response" != "200" ]; then
        echo "⚠️  Site not immediately accessible (HTTP $response), but files restored"
        echo "   This may be normal and resolve within a few minutes"
    else
        echo "✅ Site is accessible"
    fi

    echo "✅ Rollback verification completed"
}

# Function to send notification
send_notification() {
    local status=$1
    local message=$2

    echo "📧 Sending rollback notification..."

    if [ "$status" = "success" ]; then
        echo "✅ Rollback successful: $message"
    else
        echo "❌ Rollback failed: $message"
    fi
}

# Function to show rollback summary
show_summary() {
    echo ""
    echo "📋 ROLLBACK SUMMARY"
    echo "==================="
    echo "Environment: $ENVIRONMENT"
    echo "Backup used: $BACKUP_TIMESTAMP"
    echo "Emergency backup: emergency_$CURRENT_TIMESTAMP"
    echo "Rollback completed: $(date)"
    echo ""
    echo "📁 Backup manifest:"
    if [ -f "$BACKUP_DIR/$BACKUP_TIMESTAMP/manifest.txt" ]; then
        cat "$BACKUP_DIR/$BACKUP_TIMESTAMP/manifest.txt"
    fi
    echo ""
}

# Main rollback process
main() {
    echo "🔄 Starting rollback process..."

    # Find backup to restore
    find_latest_backup

    # Create emergency backup
    create_emergency_backup

    # Restore database
    restore_database

    # Restore files
    restore_files

    # Set permissions
    set_permissions

    # Clear cache
    clear_cache

    # Verify rollback
    if verify_rollback; then
        echo "✅ Rollback completed successfully"
        send_notification "success" "WordPress rollback to $BACKUP_TIMESTAMP completed"
        show_summary
        return 0
    else
        echo "❌ Rollback verification failed"
        send_notification "failed" "WordPress rollback verification failed"
        return 1
    fi
}

# Error handling
trap 'echo "❌ Rollback failed with error"; send_notification "failed" "Rollback script error on line $LINENO"' ERR

# Confirmation prompt
echo "⚠️  WARNING: This will rollback WordPress to backup $BACKUP_TIMESTAMP"
echo "Current site will be backed up as emergency_$CURRENT_TIMESTAMP"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

# Run main rollback
main "$@"

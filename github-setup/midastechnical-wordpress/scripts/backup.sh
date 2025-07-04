#!/bin/bash

# WordPress Database Backup Script for midastechnical.com
# Automated backup system with retention and verification

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_TYPE=${2:-full}  # full, database, files
RETENTION_DAYS=${3:-30}
BACKUP_DIR="/home/$(whoami)/backups"
WP_PATH="/home/$(whoami)/public_html"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup.log"

echo "📦 Starting WordPress backup for $ENVIRONMENT"
echo "Backup type: $BACKUP_TYPE"
echo "Timestamp: $TIMESTAMP"

# Create backup directory structure
mkdir -p "$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$BACKUP_DIR/logs"

# Function to log messages
log_message() {
    local message="$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $message" | tee -a "$LOG_FILE"
}

# Function to backup database
backup_database() {
    log_message "💾 Starting database backup..."
    
    local db_backup="$BACKUP_DIR/$TIMESTAMP/database.sql"
    local db_compressed="$BACKUP_DIR/$TIMESTAMP/database.sql.gz"
    
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
    
    # Create database backup
    if mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-table \
        --add-locks \
        --create-options \
        --disable-keys \
        --extended-insert \
        --quick \
        --set-charset \
        "$DB_NAME" > "$db_backup"; then
        
        # Compress database backup
        gzip "$db_backup"
        
        # Verify backup integrity
        if gunzip -t "$db_compressed" 2>/dev/null; then
            local backup_size=$(du -h "$db_compressed" | cut -f1)
            log_message "✅ Database backup completed: $backup_size"
        else
            log_message "❌ Database backup verification failed"
            return 1
        fi
    else
        log_message "❌ Database backup failed"
        return 1
    fi
}

# Function to backup WordPress files
backup_files() {
    log_message "📁 Starting WordPress files backup..."
    
    local files_backup="$BACKUP_DIR/$TIMESTAMP/wordpress-files.tar.gz"
    
    cd "$WP_PATH"
    
    # Create files backup (excluding uploads and cache)
    if tar -czf "$files_backup" \
        --exclude='wp-content/uploads' \
        --exclude='wp-content/cache' \
        --exclude='wp-content/backup*' \
        --exclude='wp-content/ai1wm-backups' \
        --exclude='wp-content/updraft' \
        --exclude='*.log' \
        --exclude='error_log' \
        --exclude='.DS_Store' \
        --exclude='Thumbs.db' \
        .; then
        
        # Verify backup integrity
        if tar -tzf "$files_backup" >/dev/null 2>&1; then
            local backup_size=$(du -h "$files_backup" | cut -f1)
            log_message "✅ Files backup completed: $backup_size"
        else
            log_message "❌ Files backup verification failed"
            return 1
        fi
    else
        log_message "❌ Files backup failed"
        return 1
    fi
}

# Function to backup uploads directory separately
backup_uploads() {
    log_message "🖼️ Starting uploads backup..."
    
    local uploads_backup="$BACKUP_DIR/$TIMESTAMP/uploads.tar.gz"
    local uploads_dir="$WP_PATH/wp-content/uploads"
    
    if [ -d "$uploads_dir" ]; then
        cd "$uploads_dir"
        
        if tar -czf "$uploads_backup" .; then
            local backup_size=$(du -h "$uploads_backup" | cut -f1)
            log_message "✅ Uploads backup completed: $backup_size"
        else
            log_message "❌ Uploads backup failed"
            return 1
        fi
    else
        log_message "⚠️  Uploads directory not found, skipping"
    fi
}

# Function to create backup manifest
create_manifest() {
    log_message "📋 Creating backup manifest..."
    
    local manifest="$BACKUP_DIR/$TIMESTAMP/manifest.txt"
    
    cat > "$manifest" << EOF
WordPress Backup Manifest
========================
Backup Date: $(date)
Environment: $ENVIRONMENT
Backup Type: $BACKUP_TYPE
Timestamp: $TIMESTAMP

Database Information:
- Host: $DB_HOST
- Database: $DB_NAME
- User: $DB_USER

WordPress Information:
- Path: $WP_PATH
- Version: $(wp core version --allow-root --path="$WP_PATH" 2>/dev/null || echo "Unknown")

Backup Contents:
EOF

    # List backup files with sizes
    if [ -f "$BACKUP_DIR/$TIMESTAMP/database.sql.gz" ]; then
        echo "- Database: database.sql.gz ($(du -h "$BACKUP_DIR/$TIMESTAMP/database.sql.gz" | cut -f1))" >> "$manifest"
    fi
    
    if [ -f "$BACKUP_DIR/$TIMESTAMP/wordpress-files.tar.gz" ]; then
        echo "- WordPress Files: wordpress-files.tar.gz ($(du -h "$BACKUP_DIR/$TIMESTAMP/wordpress-files.tar.gz" | cut -f1))" >> "$manifest"
    fi
    
    if [ -f "$BACKUP_DIR/$TIMESTAMP/uploads.tar.gz" ]; then
        echo "- Uploads: uploads.tar.gz ($(du -h "$BACKUP_DIR/$TIMESTAMP/uploads.tar.gz" | cut -f1))" >> "$manifest"
    fi
    
    # Add system information
    cat >> "$manifest" << EOF

System Information:
- Hostname: $(hostname)
- Disk Usage: $(df -h "$WP_PATH" | tail -1 | awk '{print $5}')
- Available Space: $(df -h "$WP_PATH" | tail -1 | awk '{print $4}')

Backup Verification:
- Database: $([ -f "$BACKUP_DIR/$TIMESTAMP/database.sql.gz" ] && echo "✅ Valid" || echo "❌ Missing")
- Files: $([ -f "$BACKUP_DIR/$TIMESTAMP/wordpress-files.tar.gz" ] && echo "✅ Valid" || echo "❌ Missing")
- Uploads: $([ -f "$BACKUP_DIR/$TIMESTAMP/uploads.tar.gz" ] && echo "✅ Valid" || echo "❌ Missing")

Git Information:
- Commit: ${GITHUB_SHA:-"manual"}
- Branch: ${GITHUB_REF_NAME:-"unknown"}
EOF

    log_message "✅ Backup manifest created"
}

# Function to cleanup old backups
cleanup_old_backups() {
    log_message "🧹 Cleaning up old backups (keeping $RETENTION_DAYS days)..."
    
    # Find and remove backups older than retention period
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true
    
    # Count remaining backups
    local backup_count=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | wc -l)
    log_message "✅ Cleanup completed. $backup_count backups retained"
}

# Function to verify backup integrity
verify_backup() {
    log_message "🔍 Verifying backup integrity..."
    
    local verification_passed=true
    
    # Verify database backup
    if [ -f "$BACKUP_DIR/$TIMESTAMP/database.sql.gz" ]; then
        if gunzip -t "$BACKUP_DIR/$TIMESTAMP/database.sql.gz" 2>/dev/null; then
            log_message "✅ Database backup integrity verified"
        else
            log_message "❌ Database backup integrity check failed"
            verification_passed=false
        fi
    fi
    
    # Verify files backup
    if [ -f "$BACKUP_DIR/$TIMESTAMP/wordpress-files.tar.gz" ]; then
        if tar -tzf "$BACKUP_DIR/$TIMESTAMP/wordpress-files.tar.gz" >/dev/null 2>&1; then
            log_message "✅ Files backup integrity verified"
        else
            log_message "❌ Files backup integrity check failed"
            verification_passed=false
        fi
    fi
    
    # Verify uploads backup
    if [ -f "$BACKUP_DIR/$TIMESTAMP/uploads.tar.gz" ]; then
        if tar -tzf "$BACKUP_DIR/$TIMESTAMP/uploads.tar.gz" >/dev/null 2>&1; then
            log_message "✅ Uploads backup integrity verified"
        else
            log_message "❌ Uploads backup integrity check failed"
            verification_passed=false
        fi
    fi
    
    if [ "$verification_passed" = true ]; then
        log_message "✅ All backup integrity checks passed"
        return 0
    else
        log_message "❌ Backup integrity verification failed"
        return 1
    fi
}

# Function to calculate backup statistics
calculate_stats() {
    log_message "📊 Calculating backup statistics..."
    
    local total_size=0
    local file_count=0
    
    for file in "$BACKUP_DIR/$TIMESTAMP"/*.{gz,tar.gz} 2>/dev/null; do
        if [ -f "$file" ]; then
            local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
            total_size=$((total_size + size))
            file_count=$((file_count + 1))
        fi
    done
    
    local total_size_human=$(numfmt --to=iec-i --suffix=B $total_size 2>/dev/null || echo "${total_size} bytes")
    
    log_message "📈 Backup statistics:"
    log_message "   Files created: $file_count"
    log_message "   Total size: $total_size_human"
    log_message "   Location: $BACKUP_DIR/$TIMESTAMP"
}

# Function to send backup notification
send_notification() {
    local status=$1
    local message=$2
    
    log_message "📧 Sending backup notification..."
    
    if [ "$status" = "success" ]; then
        log_message "✅ Backup completed successfully: $message"
    else
        log_message "❌ Backup failed: $message"
    fi
    
    # Add webhook notification here if needed
    # curl -X POST "$BACKUP_WEBHOOK_URL" -d "{'text':'Backup $status: $message'}"
}

# Main backup process
main() {
    log_message "🚀 Starting backup process..."
    
    # Check available disk space
    local available_space=$(df "$BACKUP_DIR" | tail -1 | awk '{print $4}')
    if [ "$available_space" -lt 1048576 ]; then  # Less than 1GB
        log_message "⚠️  Warning: Low disk space available"
    fi
    
    # Perform backup based on type
    case $BACKUP_TYPE in
        "database")
            backup_database
            ;;
        "files")
            backup_files
            backup_uploads
            ;;
        "full"|*)
            backup_database
            backup_files
            backup_uploads
            ;;
    esac
    
    # Create manifest
    create_manifest
    
    # Verify backup integrity
    if verify_backup; then
        # Calculate statistics
        calculate_stats
        
        # Cleanup old backups
        cleanup_old_backups
        
        log_message "✅ Backup process completed successfully"
        send_notification "success" "WordPress backup completed for $ENVIRONMENT"
        return 0
    else
        log_message "❌ Backup process failed verification"
        send_notification "failed" "WordPress backup verification failed for $ENVIRONMENT"
        return 1
    fi
}

# Error handling
trap 'log_message "❌ Backup failed with error on line $LINENO"; send_notification "failed" "Backup script error"' ERR

# Run main backup process
main "$@"

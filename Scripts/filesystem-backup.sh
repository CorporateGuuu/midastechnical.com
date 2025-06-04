#!/bin/bash

# File System Backup Script for midastechnical.com
# Backs up application files, images, and static assets

set -euo pipefail

# Configuration
APP_DIR="/var/www/midastechnical"
BACKUP_DIR="/var/backups/midastechnical/filesystem"
S3_BUCKET="${AWS_S3_BACKUP_BUCKET:-midastechnical-backups-prod}"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/midastechnical-filesystem-backup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting file system backup..."

# Backup application files (excluding node_modules and .next)
tar -czf "$BACKUP_DIR/app_${DATE}.tar.gz" \
    --exclude="node_modules" \
    --exclude=".next" \
    --exclude=".git" \
    --exclude="*.log" \
    -C "$(dirname "$APP_DIR")" \
    "$(basename "$APP_DIR")"

# Backup images and static assets
tar -czf "$BACKUP_DIR/images_${DATE}.tar.gz" \
    -C "$APP_DIR" \
    public/images

# Upload to S3
aws s3 cp "$BACKUP_DIR/app_${DATE}.tar.gz" \
    "s3://$S3_BUCKET/filesystem/app/" \
    --storage-class STANDARD_IA

aws s3 cp "$BACKUP_DIR/images_${DATE}.tar.gz" \
    "s3://$S3_BUCKET/filesystem/images/" \
    --storage-class STANDARD_IA

# Cleanup local backups older than 7 days
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

log "File system backup completed successfully"

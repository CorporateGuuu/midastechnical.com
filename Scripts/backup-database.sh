#!/bin/bash

# Automated Database Backup Script
# Run daily via cron job

BACKUP_DIR="/var/backups/midastechnical"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="midastechnical_backup_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Create database backup
pg_dump -h ${DB_HOST} -U backup_user -d midastechnical_store > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" "s3://${AWS_S3_BACKUP_BUCKET}/database/${BACKUP_FILE}.gz"

# Remove local backup older than 7 days
find ${BACKUP_DIR} -name "*.gz" -mtime +7 -delete

echo "✅ Database backup completed: ${BACKUP_FILE}.gz"

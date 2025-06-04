#!/bin/bash

# Database backup script for midastechnical.com
# This script creates a full PostgreSQL backup

BACKUP_DIR="/Users/apple/Desktop/Websites Code/MDTSTech.store/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="midastechnical_store"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create database backup
echo "Creating database backup..."
pg_dump -h localhost -U postgres -d $DB_NAME > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    echo "Backup compressed: $BACKUP_FILE.gz"
    
    # Remove backups older than 30 days
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
    echo "Old backups cleaned up"
    
    # Log backup to database
    psql -h localhost -U postgres -d $DB_NAME -c "
      INSERT INTO system_backups (backup_type, file_path, status, completed_at) 
      VALUES ('database', '$BACKUP_FILE.gz', 'completed', NOW())
    "
else
    echo "Backup failed!"
    exit 1
fi

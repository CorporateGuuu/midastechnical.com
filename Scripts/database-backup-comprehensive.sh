#!/bin/bash

# Comprehensive Database Backup Script for midastechnical.com
# Supports full backups, incremental backups, and point-in-time recovery

set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/midastechnical"
S3_BUCKET="${AWS_S3_BACKUP_BUCKET:-midastechnical-backups-prod}"
RETENTION_DAYS=30
COMPRESSION_LEVEL=6
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-midastechnical_store}"
DB_USER="${DB_BACKUP_USER:-backup_user}"
DB_PASSWORD="${DB_BACKUP_PASSWORD}"

# Logging
LOG_FILE="/var/log/midastechnical-backup.log"
DATE=$(date +%Y%m%d_%H%M%S)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directories
mkdir -p "$BACKUP_DIR"/{full,incremental,wal}
mkdir -p "$BACKUP_DIR"/temp

log "Starting database backup process..."

# Function: Full database backup
perform_full_backup() {
    local backup_file="midastechnical_full_${DATE}.sql"
    local backup_path="$BACKUP_DIR/full/$backup_file"

    log "Performing full database backup..."

    # Create full backup with custom format for faster restore
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=custom \
        --compress=$COMPRESSION_LEVEL \
        --verbose \
        --file="$backup_path"

    if [ $? -eq 0 ]; then
        log "Full backup completed successfully: $backup_file"

        # Encrypt backup
        if [ -n "$ENCRYPTION_KEY" ]; then
            gpg --symmetric --cipher-algo AES256 --compress-algo 1 \
                --s2k-mode 3 --s2k-digest-algo SHA512 \
                --s2k-count 65011712 --passphrase "$ENCRYPTION_KEY" \
                "$backup_path"
            rm "$backup_path"
            backup_path="${backup_path}.gpg"
            log "Backup encrypted successfully"
        fi

        # Upload to S3
        aws s3 cp "$backup_path" "s3://$S3_BUCKET/database/full/" \
            --storage-class STANDARD_IA \
            --metadata "backup-type=full,timestamp=$DATE,database=$DB_NAME"

        if [ $? -eq 0 ]; then
            log "Backup uploaded to S3 successfully"
        else
            log "ERROR: Failed to upload backup to S3"
            return 1
        fi

        # Verify backup integrity
        verify_backup "$backup_path"

    else
        log "ERROR: Full backup failed"
        return 1
    fi
}

# Function: Incremental backup using WAL files
perform_incremental_backup() {
    local wal_backup_dir="$BACKUP_DIR/wal/$DATE"
    mkdir -p "$wal_backup_dir"

    log "Performing incremental backup (WAL files)..."

    # Archive WAL files
    PGPASSWORD="$DB_PASSWORD" pg_receivewal \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -D "$wal_backup_dir" \
        --compress=$COMPRESSION_LEVEL \
        --verbose

    # Upload WAL files to S3
    aws s3 sync "$wal_backup_dir" "s3://$S3_BUCKET/database/wal/$DATE/" \
        --storage-class STANDARD_IA

    log "Incremental backup completed"
}

# Function: Verify backup integrity
verify_backup() {
    local backup_file="$1"
    log "Verifying backup integrity..."

    # Test restore to temporary database
    local test_db="test_restore_$DATE"

    PGPASSWORD="$DB_PASSWORD" createdb \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        "$test_db"

    if [ "${backup_file##*.}" = "gpg" ]; then
        # Decrypt and restore
        gpg --quiet --batch --yes --decrypt \
            --passphrase "$ENCRYPTION_KEY" \
            "$backup_file" | \
        PGPASSWORD="$DB_PASSWORD" pg_restore \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$test_db" \
            --verbose
    else
        # Direct restore
        PGPASSWORD="$DB_PASSWORD" pg_restore \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$test_db" \
            --verbose \
            "$backup_file"
    fi

    if [ $? -eq 0 ]; then
        log "Backup verification successful"

        # Cleanup test database
        PGPASSWORD="$DB_PASSWORD" dropdb \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            "$test_db"
    else
        log "ERROR: Backup verification failed"
        return 1
    fi
}

# Function: Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."

    # Remove local backups older than retention period
    find "$BACKUP_DIR" -name "*.sql*" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.gpg" -mtime +$RETENTION_DAYS -delete

    # Remove old S3 backups
    aws s3api list-objects-v2 \
        --bucket "$S3_BUCKET" \
        --prefix "database/" \
        --query "Contents[?LastModified<='$(date -d "$RETENTION_DAYS days ago" --iso-8601)'].Key" \
        --output text | \
    while read -r key; do
        if [ -n "$key" ]; then
            aws s3 rm "s3://$S3_BUCKET/$key"
            log "Removed old backup: $key"
        fi
    done
}

# Function: Send backup notification
send_notification() {
    local status="$1"
    local message="$2"

    # Send email notification
    curl -X POST "https://api.sendgrid.com/v3/mail/send" \
        -H "Authorization: Bearer $SENDGRID_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "personalizations": [{
                "to": [{"email": "admin@midastechnical.com"}]
            }],
            "from": {"email": "backup@midastechnical.com"},
            "subject": "Database Backup '$status' - midastechnical.com",
            "content": [{
                "type": "text/plain",
                "value": "'$message'"
            }]
        }'
}

# Main execution
main() {
    local backup_type="${1:-full}"

    case "$backup_type" in
        "full")
            perform_full_backup
            ;;
        "incremental")
            perform_incremental_backup
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        *)
            log "Usage: $0 {full|incremental|cleanup}"
            exit 1
            ;;
    esac

    if [ $? -eq 0 ]; then
        send_notification "SUCCESS" "Database backup completed successfully at $(date)"
        log "Backup process completed successfully"
    else
        send_notification "FAILED" "Database backup failed at $(date). Please check logs."
        log "ERROR: Backup process failed"
        exit 1
    fi
}

# Execute main function
main "$@"

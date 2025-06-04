#!/bin/bash

# Backup Verification Script for midastechnical.com
# Verifies integrity and restorability of backups

set -euo pipefail

LOG_FILE="/var/log/midastechnical-backup-verification.log"
S3_BUCKET="${AWS_S3_BACKUP_BUCKET:-midastechnical-backups-prod}"
TEST_DB="backup_verification_test"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function: Verify database backup
verify_database_backup() {
    local backup_file="$1"
    log "Verifying database backup: $backup_file"

    # Download backup from S3
    aws s3 cp "s3://$S3_BUCKET/database/full/$backup_file" /tmp/

    # Create test database
    createdb "$TEST_DB" 2>/dev/null || dropdb "$TEST_DB" && createdb "$TEST_DB"

    # Restore backup
    if [[ "$backup_file" == *.gpg ]]; then
        gpg --quiet --batch --yes --decrypt \
            --passphrase "$BACKUP_ENCRYPTION_KEY" \
            "/tmp/$backup_file" | \
        pg_restore -d "$TEST_DB" --verbose
    else
        pg_restore -d "$TEST_DB" --verbose "/tmp/$backup_file"
    fi

    if [ $? -eq 0 ]; then
        # Verify data integrity
        local product_count=$(psql -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM products;")
        local order_count=$(psql -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM orders;")

        log "Backup verification successful - Products: $product_count, Orders: $order_count"

        # Cleanup
        dropdb "$TEST_DB"
        rm "/tmp/$backup_file"

        return 0
    else
        log "ERROR: Backup verification failed"
        return 1
    fi
}

# Function: Verify file system backup
verify_filesystem_backup() {
    local backup_file="$1"
    log "Verifying file system backup: $backup_file"

    # Download backup from S3
    aws s3 cp "s3://$S3_BUCKET/filesystem/app/$backup_file" /tmp/

    # Test extraction
    tar -tzf "/tmp/$backup_file" > /dev/null

    if [ $? -eq 0 ]; then
        log "File system backup verification successful"
        rm "/tmp/$backup_file"
        return 0
    else
        log "ERROR: File system backup verification failed"
        return 1
    fi
}

# Main verification process
main() {
    log "Starting backup verification process..."

    # Get latest backups
    local latest_db_backup=$(aws s3 ls "s3://$S3_BUCKET/database/full/" | sort | tail -n 1 | awk '{print $4}')
    local latest_fs_backup=$(aws s3 ls "s3://$S3_BUCKET/filesystem/app/" | sort | tail -n 1 | awk '{print $4}')

    # Verify backups
    verify_database_backup "$latest_db_backup"
    verify_filesystem_backup "$latest_fs_backup"

    if [ $? -eq 0 ]; then
        log "All backup verifications completed successfully"

        # Send success notification
        curl -X POST "https://api.sendgrid.com/v3/mail/send" \
            -H "Authorization: Bearer $SENDGRID_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{
                "personalizations": [{
                    "to": [{"email": "admin@midastechnical.com"}]
                }],
                "from": {"email": "backup@midastechnical.com"},
                "subject": "Backup Verification SUCCESS - midastechnical.com",
                "content": [{
                    "type": "text/plain",
                    "value": "All backup verifications completed successfully at '$(date)'"
                }]
            }'
    else
        log "ERROR: Backup verification failed"

        # Send failure notification
        curl -X POST "https://api.sendgrid.com/v3/mail/send" \
            -H "Authorization: Bearer $SENDGRID_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{
                "personalizations": [{
                    "to": [{"email": "admin@midastechnical.com"}]
                }],
                "from": {"email": "backup@midastechnical.com"},
                "subject": "Backup Verification FAILED - midastechnical.com",
                "content": [{
                    "type": "text/plain",
                    "value": "Backup verification failed at '$(date)'. Please check logs immediately."
                }]
            }'

        exit 1
    fi
}

main "$@"

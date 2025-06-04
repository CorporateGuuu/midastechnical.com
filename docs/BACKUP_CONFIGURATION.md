# Database Backup Configuration
# midastechnical.com Production Environment

# Backup Schedule (Cron Jobs)
# Add these to your crontab: crontab -e

# Full backup daily at 2 AM
0 2 * * * /path/to/scripts/database-backup-comprehensive.sh full

# Incremental backup every 4 hours
0 */4 * * * /path/to/scripts/database-backup-comprehensive.sh incremental

# Cleanup old backups weekly
0 3 * * 0 /path/to/scripts/database-backup-comprehensive.sh cleanup

# Backup verification daily at 3 AM
0 3 * * * /path/to/scripts/verify-backups.sh

# Environment Variables for Backup Script
export DB_HOST="your-production-db-host"
export DB_PORT="5432"
export DB_NAME="midastechnical_store"
export DB_BACKUP_USER="backup_user"
export DB_BACKUP_PASSWORD="secure_backup_password"
export AWS_S3_BACKUP_BUCKET="midastechnical-backups-prod"
export BACKUP_ENCRYPTION_KEY="your_encryption_key"
export SENDGRID_API_KEY="your_sendgrid_api_key"

# Backup Retention Policy
# - Full backups: 30 days local, 90 days S3
# - Incremental backups: 7 days local, 30 days S3
# - WAL files: 7 days local, 30 days S3

# Recovery Time Objectives (RTO)
# - Database restore: 15 minutes
# - Full system restore: 30 minutes
# - Point-in-time recovery: 5 minutes

# Recovery Point Objectives (RPO)
# - Maximum data loss: 4 hours (incremental backup interval)
# - Critical data loss: 1 hour (with WAL archiving)

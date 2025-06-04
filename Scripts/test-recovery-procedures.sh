#!/bin/bash

# Recovery Testing Script for midastechnical.com
# Tests disaster recovery procedures in a safe environment

set -euo pipefail

LOG_FILE="/var/log/midastechnical-recovery-test.log"
TEST_ENV="staging"
DATE=$(date +%Y%m%d_%H%M%S)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function: Test database recovery
test_database_recovery() {
    log "Testing database recovery procedure..."

    local test_db="recovery_test_${DATE}"
    local backup_file=$(aws s3 ls "s3://$AWS_S3_BACKUP_BUCKET/database/full/" | sort | tail -n 1 | awk '{print $4}')

    # Download backup
    aws s3 cp "s3://$AWS_S3_BACKUP_BUCKET/database/full/$backup_file" /tmp/

    # Create test database
    createdb "$test_db"

    # Measure recovery time
    local start_time=$(date +%s)

    # Restore backup
    if [[ "$backup_file" == *.gpg ]]; then
        gpg --quiet --batch --yes --decrypt \
            --passphrase "$BACKUP_ENCRYPTION_KEY" \
            "/tmp/$backup_file" | \
        pg_restore -d "$test_db" --verbose
    else
        pg_restore -d "$test_db" --verbose "/tmp/$backup_file"
    fi

    local end_time=$(date +%s)
    local recovery_time=$((end_time - start_time))

    # Verify data integrity
    local product_count=$(psql -d "$test_db" -t -c "SELECT COUNT(*) FROM products;")
    local category_count=$(psql -d "$test_db" -t -c "SELECT COUNT(*) FROM categories;")

    log "Database recovery test completed in ${recovery_time} seconds"
    log "Recovered data: $product_count products, $category_count categories"

    # Cleanup
    dropdb "$test_db"
    rm "/tmp/$backup_file"

    # Check if recovery time meets RTO
    if [ $recovery_time -le 900 ]; then  # 15 minutes
        log "✅ Database recovery RTO met (${recovery_time}s <= 900s)"
        return 0
    else
        log "❌ Database recovery RTO exceeded (${recovery_time}s > 900s)"
        return 1
    fi
}

# Function: Test application deployment
test_application_deployment() {
    log "Testing application deployment procedure..."

    local deploy_dir="/tmp/recovery_test_${DATE}"
    mkdir -p "$deploy_dir"

    # Measure deployment time
    local start_time=$(date +%s)

    # Clone repository
    git clone https://github.com/your-org/midastechnical.git "$deploy_dir"
    cd "$deploy_dir"

    # Install dependencies
    npm ci --production

    # Build application
    npm run build

    local end_time=$(date +%s)
    local deploy_time=$((end_time - start_time))

    log "Application deployment test completed in ${deploy_time} seconds"

    # Cleanup
    rm -rf "$deploy_dir"

    # Check if deployment time meets RTO
    if [ $deploy_time -le 1800 ]; then  # 30 minutes
        log "✅ Application deployment RTO met (${deploy_time}s <= 1800s)"
        return 0
    else
        log "❌ Application deployment RTO exceeded (${deploy_time}s > 1800s)"
        return 1
    fi
}

# Function: Test communication systems
test_communication_systems() {
    log "Testing communication systems..."

    # Test email notifications
    curl -X POST "https://api.sendgrid.com/v3/mail/send" \
        -H "Authorization: Bearer $SENDGRID_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{
            "personalizations": [{
                "to": [{"email": "admin@midastechnical.com"}]
            }],
            "from": {"email": "test@midastechnical.com"},
            "subject": "Recovery Test - Communication System",
            "content": [{
                "type": "text/plain",
                "value": "This is a test of the emergency communication system."
            }]
        }'

    if [ $? -eq 0 ]; then
        log "✅ Email notification system working"
    else
        log "❌ Email notification system failed"
        return 1
    fi

    # Test Slack notifications (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d '{
                "text": "Recovery Test - Slack notification system working"
            }'

        if [ $? -eq 0 ]; then
            log "✅ Slack notification system working"
        else
            log "❌ Slack notification system failed"
            return 1
        fi
    fi

    return 0
}

# Function: Generate test report
generate_test_report() {
    local test_results="$1"

    cat > "/tmp/recovery_test_report_${DATE}.md" << EOF
# Recovery Test Report
## midastechnical.com

**Test Date:** $(date)
**Test Environment:** $TEST_ENV
**Test Results:** $test_results

## Test Summary

### Database Recovery Test
- **Status:** $(echo "$test_results" | grep -q "database_recovery:PASS" && echo "PASSED" || echo "FAILED")
- **Recovery Time:** $(echo "$test_results" | grep "database_recovery_time" | cut -d: -f2)s
- **RTO Target:** 900s (15 minutes)

### Application Deployment Test
- **Status:** $(echo "$test_results" | grep -q "app_deployment:PASS" && echo "PASSED" || echo "FAILED")
- **Deployment Time:** $(echo "$test_results" | grep "app_deployment_time" | cut -d: -f2)s
- **RTO Target:** 1800s (30 minutes)

### Communication Systems Test
- **Status:** $(echo "$test_results" | grep -q "communication:PASS" && echo "PASSED" || echo "FAILED")
- **Email System:** $(echo "$test_results" | grep -q "email:PASS" && echo "WORKING" || echo "FAILED")
- **Slack System:** $(echo "$test_results" | grep -q "slack:PASS" && echo "WORKING" || echo "FAILED")

## Recommendations

$(if echo "$test_results" | grep -q "FAIL"; then
    echo "- Address failed test components before next test cycle"
    echo "- Review and update recovery procedures as needed"
    echo "- Consider additional training for recovery team"
else
    echo "- All tests passed successfully"
    echo "- Recovery procedures are working as expected"
    echo "- Continue regular testing schedule"
fi)

## Next Test Date

**Scheduled:** $(date -d "+1 month" +%Y-%m-%d)

EOF

    # Upload report to S3
    aws s3 cp "/tmp/recovery_test_report_${DATE}.md" \
        "s3://$AWS_S3_BACKUP_BUCKET/recovery-tests/"

    log "Recovery test report generated and uploaded"
}

# Main testing procedure
main() {
    log "Starting recovery testing procedure..."

    local test_results=""
    local overall_status="PASS"

    # Test database recovery
    if test_database_recovery; then
        test_results+="
database_recovery:PASS"
    else
        test_results+="
database_recovery:FAIL"
        overall_status="FAIL"
    fi

    # Test application deployment
    if test_application_deployment; then
        test_results+="
app_deployment:PASS"
    else
        test_results+="
app_deployment:FAIL"
        overall_status="FAIL"
    fi

    # Test communication systems
    if test_communication_systems; then
        test_results+="
communication:PASS"
    else
        test_results+="
communication:FAIL"
        overall_status="FAIL"
    fi

    # Generate test report
    generate_test_report "$test_results"

    log "Recovery testing completed with status: $overall_status"

    # Send notification
    curl -X POST "https://api.sendgrid.com/v3/mail/send" \
        -H "Authorization: Bearer $SENDGRID_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            "personalizations": [{
                "to": [{"email": "admin@midastechnical.com"}]
            }],
            "from": {"email": "recovery-test@midastechnical.com"},
            "subject": "Recovery Test $overall_status - midastechnical.com",
            "content": [{
                "type": "text/plain",
                "value": "Recovery testing completed with status: $overall_status\n\nTest Date: $(date)\nResults: $test_results"
            }]
        }"

    if [ "$overall_status" = "PASS" ]; then
        exit 0
    else
        exit 1
    fi
}

main "$@"

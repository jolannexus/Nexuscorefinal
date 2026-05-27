#!/bin/bash
# Enterprise Database Disaster Recovery Script
# Should be run as a cron job inside a Kubernetes CronJob

set -e

BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
FILE_NAME="nexuscore_db_backup_${DATE}.sql.gz"

echo "[$(date)] Starting secure PostgreSQL dump..."

# Requires PGPASSWORD environment variable to be set in the CronJob
pg_dump -h $DB_HOST -p 5432 -U nexuscore_user -d nexuscore -F c -Z 9 | gzip > ${BACKUP_DIR}/${FILE_NAME}

echo "[$(date)] Backup completed: ${FILE_NAME}"

# Upload to S3 compliant storage
if [ -n "$S3_BUCKET" ]; then
  echo "[$(date)] Uploading to secure S3 storage..."
  aws s3 cp ${BACKUP_DIR}/${FILE_NAME} s3://${S3_BUCKET}/backups/${FILE_NAME} --server-side-encryption aws:kms
  echo "[$(date)] S3 Upload completed. Data securely encrypted at rest."
fi

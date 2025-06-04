#!/bin/bash

# Production Database Setup Script
# Run this script to set up the production database

echo "🗄️  Setting up production database..."

# Create production database user
psql -h ${DB_HOST} -U postgres -c "
CREATE USER midastechnical_user WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE midastechnical_store OWNER midastechnical_user;
GRANT ALL PRIVILEGES ON DATABASE midastechnical_store TO midastechnical_user;
"

# Connect to the database and create tables
psql -h ${DB_HOST} -U midastechnical_user -d midastechnical_store -c "
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));

-- Create backup user
CREATE USER backup_user WITH PASSWORD '${BACKUP_PASSWORD}';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO backup_user;

-- Configure connection limits
ALTER USER midastechnical_user CONNECTION LIMIT 20;
ALTER USER backup_user CONNECTION LIMIT 5;
"

echo "✅ Production database setup complete"

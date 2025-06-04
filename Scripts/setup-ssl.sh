#!/bin/bash

# SSL Certificate Setup for midastechnical.com
# This script sets up Let's Encrypt SSL certificate

echo "🔒 Setting up SSL certificate for midastechnical.com..."

# Install Certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Obtain SSL certificate
sudo certbot --nginx -d midastechnical.com -d www.midastechnical.com --non-interactive --agree-tos --email admin@midastechnical.com

# Set up automatic renewal
sudo crontab -l | grep -q "certbot renew" || (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

echo "✅ SSL certificate configured and auto-renewal enabled"

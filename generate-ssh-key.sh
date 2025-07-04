#!/bin/bash

# SSH Key Generation for midastechnical.com Deployment
# Run this script to generate SSH keys for secure deployment

echo "🔑 Generating SSH Key for WordPress Deployment"
echo "=============================================="

# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "deployment@midastechnical.com" -f ~/.ssh/midastechnical_deploy -N ""

echo ""
echo "✅ SSH Key Generated Successfully!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. ADD PUBLIC KEY TO SITEGROUND:"
echo "   - Copy this public key:"
echo ""
cat ~/.ssh/midastechnical_deploy.pub
echo ""
echo "   - Go to SiteGround Site Tools → SSH Keys"
echo "   - Click 'Add New Key'"
echo "   - Paste the public key above"
echo "   - Save the key"
echo ""
echo "2. ADD PRIVATE KEY TO GITHUB SECRETS:"
echo "   - Secret Name: SITEGROUND_SSH_KEY"
echo "   - Secret Value: Copy the ENTIRE content below (including headers):"
echo ""
echo "-----BEGIN PRIVATE KEY CONTENT-----"
cat ~/.ssh/midastechnical_deploy
echo "-----END PRIVATE KEY CONTENT-----"
echo ""
echo "⚠️  IMPORTANT: Copy the ENTIRE private key including the"
echo "   -----BEGIN OPENSSH PRIVATE KEY----- and"
echo "   -----END OPENSSH PRIVATE KEY----- lines"
echo ""
echo "🔒 Security Note: The private key is sensitive - only add it to GitHub Secrets"

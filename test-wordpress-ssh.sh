#!/bin/bash

# WordPress.com SSH Connection Test Script
# Tests SSH and SFTP connectivity after key setup

echo "🔐 WordPress.com SSH Connection Test"
echo "===================================="
echo "Site: midastechnical.com"
echo "Testing SSH key authentication..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSH_KEY="$HOME/.ssh/midastechnical_deploy"
SITE_ID="midastechnical.com"

echo -e "${BLUE}📋 Configuration${NC}"
echo "SSH Key: $SSH_KEY"
echo "Site: $SITE_ID"
echo ""

# Check if SSH key exists
echo -e "${BLUE}🔍 Checking SSH Key...${NC}"
if [ -f "$SSH_KEY" ]; then
    echo -e "${GREEN}✅ SSH private key found${NC}"

    # Check key permissions
    KEY_PERMS=$(stat -f "%A" "$SSH_KEY")
    if [ "$KEY_PERMS" = "600" ]; then
        echo -e "${GREEN}✅ SSH key permissions correct (600)${NC}"
    else
        echo -e "${YELLOW}⚠️  SSH key permissions: $KEY_PERMS (should be 600)${NC}"
        echo -e "${BLUE}   Fixing permissions...${NC}"
        chmod 600 "$SSH_KEY"
        echo -e "${GREEN}✅ SSH key permissions fixed${NC}"
    fi
else
    echo -e "${RED}❌ SSH private key not found at $SSH_KEY${NC}"
    exit 1
fi
echo ""

# Check if public key exists
echo -e "${BLUE}🔍 Checking Public Key...${NC}"
if [ -f "${SSH_KEY}.pub" ]; then
    echo -e "${GREEN}✅ SSH public key found${NC}"
    echo -e "${BLUE}📋 Public key content:${NC}"
    cat "${SSH_KEY}.pub"
else
    echo -e "${RED}❌ SSH public key not found${NC}"
    exit 1
fi
echo ""

# WordPress.com SSH connection details
echo -e "${BLUE}📋 WordPress.com SSH Details${NC}"
echo "Host: ssh.atomicsites.net"
echo "Port: 22"
echo "Username: [Your WordPress.com username]"
echo "Key: $SSH_KEY"
echo ""

# Note: WordPress.com uses a specific SSH format
echo -e "${YELLOW}📝 Important Notes:${NC}"
echo "1. WordPress.com SSH requires the key to be added to your account first"
echo "2. SSH access is available for Business and Commerce plans"
echo "3. Connection format: ssh [username]@ssh.atomicsites.net"
echo "4. SFTP format: sftp [username]@ssh.atomicsites.net"
echo ""

# Test SSH connection (will require username)
echo -e "${BLUE}🧪 SSH Connection Test${NC}"
echo "To test SSH connection, you'll need your WordPress.com username."
echo ""
echo -e "${YELLOW}Manual test commands:${NC}"
echo "SSH:  ssh -i $SSH_KEY [your-wp-username]@ssh.atomicsites.net"
echo "SFTP: sftp -i $SSH_KEY [your-wp-username]@ssh.atomicsites.net"
echo ""

# Create SSH config entry
echo -e "${BLUE}⚙️  Creating SSH Config Entry...${NC}"
SSH_CONFIG="$HOME/.ssh/config"

# Check if config exists
if [ ! -f "$SSH_CONFIG" ]; then
    touch "$SSH_CONFIG"
    chmod 600 "$SSH_CONFIG"
fi

# Check if WordPress.com entry already exists
if grep -q "Host wordpress-midastechnical" "$SSH_CONFIG"; then
    echo -e "${YELLOW}⚠️  SSH config entry already exists${NC}"
else
    echo -e "${BLUE}📝 Adding SSH config entry...${NC}"
    cat >> "$SSH_CONFIG" << EOF

# WordPress.com - Midastechnical.com
Host wordpress-midastechnical
    HostName ssh.atomicsites.net
    User [YOUR_WORDPRESS_USERNAME]
    IdentityFile $SSH_KEY
    Port 22
    IdentitiesOnly yes

EOF
    echo -e "${GREEN}✅ SSH config entry added${NC}"
fi
echo ""

# Display SSH config
echo -e "${BLUE}📋 SSH Config Entry:${NC}"
echo "Host wordpress-midastechnical"
echo "    HostName ssh.atomicsites.net"
echo "    User [YOUR_WORDPRESS_USERNAME]"
echo "    IdentityFile $SSH_KEY"
echo "    Port 22"
echo "    IdentitiesOnly yes"
echo ""

# Instructions for completing setup
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Add the SSH public key to your WordPress.com account:"
echo "   - Go to: https://wordpress.com/me/security"
echo "   - Add SSH Key with the public key shown above"
echo ""
echo "2. Attach the key to your site:"
echo "   - Go to: https://wordpress.com/sites"
echo "   - Select: midastechnical.com"
echo "   - Settings → General → SSH Keys"
echo "   - Select your key and save"
echo ""
echo "3. Update SSH config with your WordPress.com username:"
echo "   - Edit: ~/.ssh/config"
echo "   - Replace [YOUR_WORDPRESS_USERNAME] with your actual username"
echo ""
echo "4. Test the connection:"
echo "   - SSH: ssh wordpress-midastechnical"
echo "   - SFTP: sftp wordpress-midastechnical"
echo ""

# SFTP usage examples
echo -e "${BLUE}📋 SFTP Usage Examples:${NC}"
echo "# Connect to SFTP"
echo "sftp wordpress-midastechnical"
echo ""
echo "# Common SFTP commands:"
echo "ls                    # List files"
echo "cd wp-content/themes  # Change directory"
echo "put local-file.php    # Upload file"
echo "get remote-file.php   # Download file"
echo "mkdir new-directory   # Create directory"
echo "quit                  # Exit SFTP"
echo ""

# WordPress.com specific paths
echo -e "${BLUE}📋 WordPress.com File Paths:${NC}"
echo "WordPress root:       /srv/htdocs/"
echo "Themes:              /srv/htdocs/wp-content/themes/"
echo "Plugins:             /srv/htdocs/wp-content/plugins/"
echo "Uploads:             /srv/htdocs/wp-content/uploads/"
echo "wp-config.php:       /srv/htdocs/wp-config.php"
echo ""

# Security reminders
echo -e "${BLUE}🔒 Security Reminders:${NC}"
echo "✅ Keep your private key secure (never share)"
echo "✅ Use SSH key authentication (more secure than passwords)"
echo "✅ Regularly rotate SSH keys"
echo "✅ Monitor SSH access logs"
echo "✅ Use SFTP for file transfers (encrypted)"
echo ""

echo -e "${GREEN}🎉 SSH Key Test Setup Complete!${NC}"
echo "Follow the next steps above to complete the WordPress.com SSH setup."

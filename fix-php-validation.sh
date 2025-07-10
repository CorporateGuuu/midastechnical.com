#!/bin/bash

# Fix PHP Validation Error for VS Code
# This script installs PHP and configures VS Code PHP validation

echo "🔧 Fixing PHP Validation Error for VS Code"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Homebrew is installed
echo -e "${BLUE}📋 Checking Homebrew installation...${NC}"
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠️  Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
        export PATH="/opt/homebrew/bin:$PATH"
    fi
    
    # Reload shell configuration
    source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null || true
else
    echo -e "${GREEN}✅ Homebrew is installed${NC}"
fi

# Check if PHP is already installed
echo -e "${BLUE}📋 Checking PHP installation...${NC}"
if command -v php &> /dev/null; then
    PHP_VERSION=$(php --version | head -n 1)
    PHP_PATH=$(which php)
    echo -e "${GREEN}✅ PHP is already installed: $PHP_VERSION${NC}"
    echo -e "${GREEN}   Location: $PHP_PATH${NC}"
else
    echo -e "${YELLOW}⚠️  PHP not found. Installing PHP...${NC}"
    
    # Install PHP via Homebrew
    brew install php
    
    # Add PHP to PATH if needed
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
        export PATH="/opt/homebrew/bin:$PATH"
    else
        echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
        export PATH="/usr/local/bin:$PATH"
    fi
    
    # Reload shell configuration
    source ~/.zshrc 2>/dev/null || source ~/.bash_profile 2>/dev/null || true
    
    # Verify installation
    if command -v php &> /dev/null; then
        PHP_VERSION=$(php --version | head -n 1)
        PHP_PATH=$(which php)
        echo -e "${GREEN}✅ PHP installed successfully: $PHP_VERSION${NC}"
        echo -e "${GREEN}   Location: $PHP_PATH${NC}"
    else
        echo -e "${RED}❌ PHP installation failed${NC}"
        exit 1
    fi
fi

# Get PHP executable path
PHP_PATH=$(which php)
echo -e "${BLUE}📋 PHP executable path: $PHP_PATH${NC}"

# Create VS Code settings directory if it doesn't exist
VSCODE_SETTINGS_DIR="$HOME/.vscode"
mkdir -p "$VSCODE_SETTINGS_DIR"

# Configure VS Code PHP settings
echo -e "${BLUE}📋 Configuring VS Code PHP settings...${NC}"

# Create or update VS Code settings.json
SETTINGS_FILE="$VSCODE_SETTINGS_DIR/settings.json"

# Check if settings.json exists
if [ -f "$SETTINGS_FILE" ]; then
    echo -e "${YELLOW}⚠️  Existing VS Code settings found. Creating backup...${NC}"
    cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update existing settings (simple approach - add PHP settings)
    # Remove existing PHP settings if they exist
    grep -v "php\." "$SETTINGS_FILE" > "$SETTINGS_FILE.tmp" || true
    
    # Add PHP settings (remove closing brace, add PHP settings, add closing brace)
    sed '$ d' "$SETTINGS_FILE.tmp" > "$SETTINGS_FILE.new"
    
    # Add comma if file has content
    if [ -s "$SETTINGS_FILE.new" ]; then
        echo "," >> "$SETTINGS_FILE.new"
    else
        echo "{" >> "$SETTINGS_FILE.new"
    fi
    
    # Add PHP settings
    cat >> "$SETTINGS_FILE.new" << EOF
    "php.validate.executablePath": "$PHP_PATH",
    "php.suggest.basic": true,
    "php.validate.enable": true,
    "php.validate.run": "onSave"
}
EOF
    
    mv "$SETTINGS_FILE.new" "$SETTINGS_FILE"
    rm -f "$SETTINGS_FILE.tmp"
else
    # Create new settings.json
    cat > "$SETTINGS_FILE" << EOF
{
    "php.validate.executablePath": "$PHP_PATH",
    "php.suggest.basic": true,
    "php.validate.enable": true,
    "php.validate.run": "onSave"
}
EOF
fi

echo -e "${GREEN}✅ VS Code PHP settings configured${NC}"

# Test PHP installation
echo -e "${BLUE}📋 Testing PHP installation...${NC}"
if php --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PHP is working correctly${NC}"
    php --version | head -n 1
else
    echo -e "${RED}❌ PHP test failed${NC}"
    exit 1
fi

# Display PHP modules (first 10)
echo -e "${BLUE}📋 Available PHP modules (first 10):${NC}"
php -m | head -10

echo ""
echo -e "${GREEN}🎉 PHP Validation Fix Complete!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "✅ PHP installed at: $PHP_PATH"
echo -e "✅ VS Code settings configured"
echo -e "✅ PHP validation should now work in VS Code"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Restart VS Code if it's currently open"
echo "2. Open any .php file in VS Code"
echo "3. Check that PHP validation errors are resolved"
echo ""
echo -e "${BLUE}📞 If issues persist:${NC}"
echo "- Check VS Code PHP extension is installed"
echo "- Verify settings in VS Code: Preferences → Settings → Search 'php.validate'"
echo "- Restart VS Code completely"
echo ""
echo -e "${GREEN}✅ PHP validation error should now be resolved!${NC}"

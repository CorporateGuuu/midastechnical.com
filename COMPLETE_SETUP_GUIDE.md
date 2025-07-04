# Complete WordPress Deployment Setup Guide

## 🚨 IMMEDIATE ACTIONS REQUIRED

The local repository is fully prepared with all files, but the GitHub repository needs to be created manually.

---

## 📋 STEP 1: CREATE GITHUB REPOSITORY (5 minutes)

### **Manual Repository Creation**
1. **Go to**: https://github.com/new
2. **Repository name**: `midastechnical-wordpress`
3. **Description**: `WordPress e-commerce platform for MDTS - Midas Technical Solutions`
4. **Visibility**: ✅ **Private**
5. **Initialize repository**: ❌ **Do NOT check any boxes**
   - No README
   - No .gitignore
   - No license
6. **Click**: "Create repository"

---

## 📋 STEP 2: PUSH LOCAL REPOSITORY (2 minutes)

After creating the repository, run these commands in the terminal:

```bash
# Navigate to the local repository
cd "/Users/apple/Desktop/Websites Code/Midastechnical.com/github-setup/midastechnical-wordpress"

# Verify remote is set
git remote -v

# Push main branch
git push -u origin main

# Create and push staging branch
git checkout -b staging
git push -u origin staging

# Return to main branch
git checkout main
```

**Expected Result**: All files uploaded to GitHub repository

---

## 📋 STEP 3: VERIFY REPOSITORY SETUP (2 minutes)

Check that these are visible in your GitHub repository:

### **GitHub Actions Workflows**
- [ ] `.github/workflows/deploy-production.yml`
- [ ] `.github/workflows/deploy-staging.yml`
- [ ] `.github/workflows/wordpress-updates.yml`
- [ ] `.github/workflows/notifications.yml`

### **Configuration Files**
- [ ] `config/wp-config-production.php`
- [ ] `config/wp-config-staging.php`
- [ ] `config/.htaccess-production`
- [ ] `config/.htaccess-staging`

### **Deployment Scripts**
- [ ] `scripts/deploy.sh`
- [ ] `scripts/backup.sh`
- [ ] `scripts/rollback.sh`
- [ ] `scripts/export-wordpress.sh`

### **Documentation**
- [ ] `docs/github-secrets-setup.md`
- [ ] `docs/team-deployment-guide.md`
- [ ] `README.md`
- [ ] `composer.json`

---

## 📋 STEP 4: CONFIGURE GITHUB SECRETS (30 minutes)

### **Access GitHub Secrets**
1. Go to: https://github.com/CorporateGuuu/midastechnical-wordpress/settings/secrets/actions
2. Click "New repository secret" for each secret below

### **Required Secrets (25+ secrets)**

#### **SiteGround Hosting**
```
SITEGROUND_HOST = [Your SiteGround server IP]
SITEGROUND_USERNAME = [Your SiteGround username]
SITEGROUND_PASSWORD = [Your SiteGround password]
SITEGROUND_SSH_KEY = [Your private SSH key - full content]
```

#### **Database Credentials**
```
DB_USERNAME = [Production database username]
DB_PASSWORD = [Production database password]
DB_NAME = [Production database name]
DB_HOST = localhost
```

#### **WordPress Security Keys**
Generate at: https://api.wordpress.org/secret-key/1.1/salt/
```
AUTH_KEY = [Generated key]
SECURE_AUTH_KEY = [Generated key]
LOGGED_IN_KEY = [Generated key]
NONCE_KEY = [Generated key]
AUTH_SALT = [Generated salt]
SECURE_AUTH_SALT = [Generated salt]
LOGGED_IN_SALT = [Generated salt]
NONCE_SALT = [Generated salt]
```

#### **Stripe Payment**
```
STRIPE_PUBLISHABLE_KEY = pk_live_[your_key]
STRIPE_SECRET_KEY = sk_live_[your_key]
STRIPE_WEBHOOK_SECRET = whsec_[your_secret]
STRIPE_TEST_PUBLISHABLE_KEY = pk_test_[your_key]
STRIPE_TEST_SECRET_KEY = sk_test_[your_key]
STRIPE_TEST_WEBHOOK_SECRET = whsec_[your_test_secret]
```

#### **Email Configuration**
```
SMTP_USER = noreply@midastechnical.com
SMTP_PASS = [Your email password]
NOTIFICATION_EMAIL = admin@midastechnical.com
```

#### **Staging Environment**
```
SITEGROUND_STAGING_HOST = [Staging server IP]
SITEGROUND_STAGING_USERNAME = [Staging username]
SITEGROUND_STAGING_PASSWORD = [Staging password]
SITEGROUND_STAGING_SSH_KEY = [Staging SSH key]
STAGING_DB_USERNAME = [Staging DB username]
STAGING_DB_PASSWORD = [Staging DB password]
STAGING_DB_NAME = [Staging DB name]
STAGING_DB_HOST = localhost
STAGING_URL = https://staging-123456.siteground.site
STAGING_SMTP_PASS = [Staging email password]
```

**Detailed Guide**: See `docs/github-secrets-setup.md` in the repository

---

## 📋 STEP 5: EXPORT WORDPRESS FROM SITEGROUND (15 minutes)

### **SSH to SiteGround Server**
```bash
ssh [username]@[server-ip]
cd public_html
```

### **Create Export Script**
```bash
cat > export-wordpress.sh << 'EOF'
#!/bin/bash
set -e

EXPORT_DIR="/tmp/wp_export_$(date +%Y%m%d_%H%M%S)"
WP_PATH="/home/$(whoami)/public_html"

echo "📦 Exporting WordPress from SiteGround"
mkdir -p "$EXPORT_DIR/wp-content/themes"
mkdir -p "$EXPORT_DIR/wp-content/plugins"

# Export MDTS theme
if [ -d "wp-content/themes/mdts-theme" ]; then
    cp -r wp-content/themes/mdts-theme "$EXPORT_DIR/wp-content/themes/"
    echo "✅ MDTS theme exported"
fi

# Export MDTS Stripe plugin
if [ -d "wp-content/plugins/mdts-stripe-integration" ]; then
    cp -r wp-content/plugins/mdts-stripe-integration "$EXPORT_DIR/wp-content/plugins/"
    echo "✅ MDTS Stripe plugin exported"
fi

# Export other custom themes/plugins
cd wp-content/themes
for theme in */; do
    if [[ ! "$theme" =~ ^twenty ]] && [ "$theme" != "mdts-theme/" ]; then
        cp -r "$theme" "$EXPORT_DIR/wp-content/themes/"
        echo "📁 Exported theme: $theme"
    fi
done

cd ../plugins
for plugin in */; do
    if [[ ! "$plugin" =~ ^(akismet|hello|woocommerce|wordfence|yoast) ]] && [ "$plugin" != "mdts-stripe-integration/" ]; then
        cp -r "$plugin" "$EXPORT_DIR/wp-content/plugins/"
        echo "📁 Exported plugin: $plugin"
    fi
done

# Export configuration
cd "$WP_PATH"
cp .htaccess "$EXPORT_DIR/.htaccess-production" 2>/dev/null || true

# Package export
cd "$(dirname "$EXPORT_DIR")"
tar -czf "wordpress-export-$(date +%Y%m%d_%H%M%S).tar.gz" "$(basename "$EXPORT_DIR")"

echo "✅ Export completed!"
echo "📁 Download: $(pwd)/wordpress-export-*.tar.gz"
EOF

chmod +x export-wordpress.sh
./export-wordpress.sh
```

### **Download Export**
```bash
# From your local machine
scp [username]@[server-ip]:/tmp/wordpress-export-*.tar.gz ./
```

**Detailed Guide**: See `docs/siteground-export-instructions.md` in the repository

---

## 📋 STEP 6: ADD WORDPRESS FILES TO REPOSITORY (10 minutes)

### **Extract and Add Files**
```bash
# Extract downloaded export
tar -xzf wordpress-export-*.tar.gz

# Navigate to repository
cd "/Users/apple/Desktop/Websites Code/Midastechnical.com/github-setup/midastechnical-wordpress"

# Copy WordPress files
cp -r ../wp_export_*/wp-content/themes/* wp-content/themes/
cp -r ../wp_export_*/wp-content/plugins/* wp-content/plugins/
cp ../wp_export_*/.htaccess-production config/

# Commit and push
git add wp-content/
git add config/
git commit -m "Add WordPress themes, plugins, and configuration

- MDTS custom theme
- MDTS Stripe integration plugin
- Production configuration files
- Custom themes and plugins"

git push origin main
```

---

## 📋 STEP 7: TEST DEPLOYMENT PIPELINE (20 minutes)

### **Test Staging Deployment**
```bash
# Push to staging branch to trigger deployment
git checkout staging
git merge main
git push origin staging
```

### **Monitor Deployment**
1. Go to: https://github.com/CorporateGuuu/midastechnical-wordpress/actions
2. Watch the "Deploy to Staging" workflow
3. Verify staging site loads correctly

### **Test Production Deployment**
```bash
# Create production pull request
git checkout main
gh pr create --title "Initial WordPress deployment" --body "Deploy WordPress to production"
```

1. Review and merge the pull request
2. Watch "Deploy to Production" workflow
3. Verify https://midastechnical.com loads correctly

---

## 📋 STEP 8: VERIFY PRODUCTION READINESS (10 minutes)

### **Functionality Checklist**
- [ ] Homepage loads: https://midastechnical.com
- [ ] Shop page works: https://midastechnical.com/shop/
- [ ] Product pages load correctly
- [ ] Checkout process functional
- [ ] Admin dashboard accessible
- [ ] SSL certificate valid (green padlock)
- [ ] Payment processing works (test with Stripe test cards)

### **Deployment System Checklist**
- [ ] Automated backups working
- [ ] Rollback procedures tested
- [ ] Monitoring notifications active
- [ ] GitHub Actions workflows successful
- [ ] All secrets configured correctly

---

## 🎯 SUCCESS CRITERIA

### **Repository Setup Complete**
- ✅ GitHub repository created and accessible
- ✅ All workflows and scripts uploaded
- ✅ Main and staging branches established
- ✅ All GitHub Secrets configured

### **WordPress Integration Complete**
- ✅ WordPress files exported from SiteGround
- ✅ MDTS theme and plugins in repository
- ✅ Configuration files updated
- ✅ All files committed to version control

### **Deployment System Operational**
- ✅ Staging deployment successful
- ✅ Production deployment successful
- ✅ All functionality verified
- ✅ Monitoring and alerts active

---

## 📞 SUPPORT

### **If You Need Help**
- **Repository Issues**: Check GitHub repository settings
- **Deployment Failures**: Review GitHub Actions logs
- **WordPress Issues**: Check SiteGround server logs
- **Emergency**: Use rollback script: `./scripts/rollback.sh`

### **Documentation References**
- **GitHub Secrets**: `docs/github-secrets-setup.md`
- **Team Guide**: `docs/team-deployment-guide.md`
- **WordPress Export**: `docs/siteground-export-instructions.md`

---

## 🚀 ESTIMATED COMPLETION TIME

**Total Time**: 1.5 - 2 hours
- Repository creation: 5 minutes
- Secrets configuration: 30 minutes
- WordPress export: 15 minutes
- File integration: 10 minutes
- Deployment testing: 20 minutes
- Verification: 10 minutes

**The WordPress deployment system will be fully operational once all steps are complete!**

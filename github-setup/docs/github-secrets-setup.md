# GitHub Secrets Setup Guide

## 🔐 Overview

This guide provides step-by-step instructions for configuring GitHub Secrets required for the automated deployment pipeline of midastechnical.com WordPress site.

## 📋 Required Secrets

### **Production Environment Secrets**

#### **SiteGround Hosting Credentials**
```
SITEGROUND_HOST
SITEGROUND_USERNAME
SITEGROUND_PASSWORD
SITEGROUND_SSH_KEY
```

#### **Database Credentials**
```
DB_USERNAME
DB_PASSWORD
DB_NAME
DB_HOST (usually 'localhost')
```

#### **WordPress Security Keys**
```
AUTH_KEY
SECURE_AUTH_KEY
LOGGED_IN_KEY
NONCE_KEY
AUTH_SALT
SECURE_AUTH_SALT
LOGGED_IN_SALT
NONCE_SALT
```

### **Staging Environment Secrets**

#### **SiteGround Staging Credentials**
```
SITEGROUND_STAGING_HOST
SITEGROUND_STAGING_USERNAME
SITEGROUND_STAGING_PASSWORD
SITEGROUND_STAGING_SSH_KEY
```

#### **Staging Database Credentials**
```
STAGING_DB_USERNAME
STAGING_DB_PASSWORD
STAGING_DB_NAME
STAGING_DB_HOST
STAGING_URL
```

### **Third-Party Service Credentials**

#### **Stripe Payment Processing**
```
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_TEST_PUBLISHABLE_KEY
STRIPE_TEST_SECRET_KEY
STRIPE_TEST_WEBHOOK_SECRET
```

#### **Email Configuration**
```
SMTP_USER
SMTP_PASS
STAGING_SMTP_PASS
```

---

## 🔧 Step-by-Step Setup Instructions

### **Step 1: Access GitHub Repository Settings**

1. **Navigate to your repository**: https://github.com/CorporateGuuu/midastechnical-wordpress
2. **Click on "Settings"** tab
3. **Select "Secrets and variables"** from the left sidebar
4. **Click on "Actions"**

### **Step 2: Gather Required Information**

#### **SiteGround Hosting Information**

1. **Login to SiteGround**: https://my.siteground.com/
2. **Access Site Tools** for midastechnical.com
3. **Navigate to**: Site → Site Information
4. **Record**:
   - Server IP Address (for SITEGROUND_HOST)
   - Username (for SITEGROUND_USERNAME)
   - Password (for SITEGROUND_PASSWORD)

#### **SSH Key Generation**

```bash
# Generate SSH key pair for deployment
ssh-keygen -t rsa -b 4096 -C "deployment@midastechnical.com" -f ~/.ssh/midastechnical_deploy

# Copy public key to SiteGround
cat ~/.ssh/midastechnical_deploy.pub
# Add this to SiteGround SSH Keys in Site Tools

# Copy private key for GitHub Secret
cat ~/.ssh/midastechnical_deploy
# This goes in SITEGROUND_SSH_KEY secret
```

#### **Database Information**

1. **In SiteGround Site Tools**: MySQL → Databases
2. **Record**:
   - Database name
   - Database username
   - Database password (if you have it, or reset it)

#### **WordPress Security Keys**

1. **Generate new keys**: https://api.wordpress.org/secret-key/1.1/salt/
2. **Copy each key** for the respective secret

#### **Stripe Credentials**

1. **Login to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Navigate to**: Developers → API keys
3. **Record**:
   - Publishable key (live)
   - Secret key (live)
   - Webhook secret (from webhook configuration)
4. **For test keys**: Switch to test mode and repeat

### **Step 3: Add Secrets to GitHub**

For each secret listed above:

1. **Click "New repository secret"**
2. **Enter the secret name** (exactly as listed above)
3. **Enter the secret value**
4. **Click "Add secret"**

#### **Example: Adding Database Username**

```
Name: DB_USERNAME
Value: midastechnical_user
```

#### **Example: Adding SSH Key**

```
Name: SITEGROUND_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
[... full private key content ...]
-----END OPENSSH PRIVATE KEY-----
```

### **Step 4: Environment-Specific Configuration**

#### **Production Environment**

1. **Go to**: Settings → Environments
2. **Click "New environment"**
3. **Name**: `production`
4. **Add protection rules**:
   - Required reviewers: 1
   - Deployment branches: `main` only

#### **Staging Environment**

1. **Create environment**: `staging`
2. **Add protection rules**:
   - Deployment branches: `staging` and `develop`

---

## 🔍 Verification Checklist

### **Required Secrets Verification**

- [ ] **SITEGROUND_HOST** - Server IP or hostname
- [ ] **SITEGROUND_USERNAME** - SiteGround username
- [ ] **SITEGROUND_PASSWORD** - SiteGround password
- [ ] **SITEGROUND_SSH_KEY** - Private SSH key (full content)
- [ ] **DB_USERNAME** - Database username
- [ ] **DB_PASSWORD** - Database password
- [ ] **DB_NAME** - Database name
- [ ] **DB_HOST** - Database host (usually 'localhost')

### **WordPress Security Keys**

- [ ] **AUTH_KEY** - WordPress authentication key
- [ ] **SECURE_AUTH_KEY** - WordPress secure authentication key
- [ ] **LOGGED_IN_KEY** - WordPress logged in key
- [ ] **NONCE_KEY** - WordPress nonce key
- [ ] **AUTH_SALT** - WordPress authentication salt
- [ ] **SECURE_AUTH_SALT** - WordPress secure authentication salt
- [ ] **LOGGED_IN_SALT** - WordPress logged in salt
- [ ] **NONCE_SALT** - WordPress nonce salt

### **Staging Environment**

- [ ] **SITEGROUND_STAGING_HOST** - Staging server details
- [ ] **SITEGROUND_STAGING_USERNAME** - Staging username
- [ ] **SITEGROUND_STAGING_PASSWORD** - Staging password
- [ ] **SITEGROUND_STAGING_SSH_KEY** - Staging SSH key
- [ ] **STAGING_DB_USERNAME** - Staging database username
- [ ] **STAGING_DB_PASSWORD** - Staging database password
- [ ] **STAGING_DB_NAME** - Staging database name
- [ ] **STAGING_DB_HOST** - Staging database host
- [ ] **STAGING_URL** - Full staging URL

### **Third-Party Services**

- [ ] **STRIPE_PUBLISHABLE_KEY** - Live Stripe publishable key
- [ ] **STRIPE_SECRET_KEY** - Live Stripe secret key
- [ ] **STRIPE_WEBHOOK_SECRET** - Live Stripe webhook secret
- [ ] **STRIPE_TEST_PUBLISHABLE_KEY** - Test Stripe publishable key
- [ ] **STRIPE_TEST_SECRET_KEY** - Test Stripe secret key
- [ ] **STRIPE_TEST_WEBHOOK_SECRET** - Test Stripe webhook secret
- [ ] **SMTP_USER** - Email SMTP username
- [ ] **SMTP_PASS** - Email SMTP password
- [ ] **STAGING_SMTP_PASS** - Staging email password

---

## 🧪 Testing Secrets Configuration

### **Test Deployment Pipeline**

1. **Create test branch**:
   ```bash
   git checkout -b test-deployment
   git push origin test-deployment
   ```

2. **Check GitHub Actions**:
   - Go to Actions tab
   - Verify workflow runs without secret errors

3. **Test staging deployment**:
   ```bash
   git checkout staging
   git merge test-deployment
   git push origin staging
   ```

### **Verify Secret Access**

Create a test workflow to verify secrets are accessible:

```yaml
name: Test Secrets
on: workflow_dispatch

jobs:
  test-secrets:
    runs-on: ubuntu-latest
    steps:
    - name: Test secret access
      run: |
        echo "Testing secret access..."
        if [ -z "${{ secrets.SITEGROUND_HOST }}" ]; then
          echo "❌ SITEGROUND_HOST not set"
        else
          echo "✅ SITEGROUND_HOST is set"
        fi
        # Add similar checks for other critical secrets
```

---

## 🔒 Security Best Practices

### **Secret Management**

1. **Use unique passwords** for each environment
2. **Rotate secrets regularly** (every 90 days)
3. **Use SSH keys** instead of passwords where possible
4. **Limit secret access** to necessary workflows only

### **Access Control**

1. **Enable branch protection** for main branch
2. **Require pull request reviews** for production deployments
3. **Use environment protection rules**
4. **Monitor secret usage** in Actions logs

### **Monitoring**

1. **Set up alerts** for failed deployments
2. **Monitor secret usage** in audit logs
3. **Regular security reviews** of access permissions
4. **Backup secret values** securely offline

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Secret Not Found Error**
```
Error: Secret SITEGROUND_HOST not found
```
**Solution**: Verify secret name matches exactly (case-sensitive)

#### **SSH Connection Failed**
```
Error: Permission denied (publickey)
```
**Solution**: 
1. Verify SSH key format (include headers/footers)
2. Check public key is added to SiteGround
3. Verify SSH key permissions

#### **Database Connection Failed**
```
Error: Access denied for user
```
**Solution**:
1. Verify database credentials
2. Check database user permissions
3. Confirm database host is correct

### **Emergency Procedures**

#### **Compromised Secrets**
1. **Immediately rotate** all affected credentials
2. **Update GitHub Secrets** with new values
3. **Review access logs** for unauthorized usage
4. **Notify team** of security incident

#### **Deployment Failures**
1. **Check Actions logs** for specific errors
2. **Verify secret values** are current
3. **Test connection** to hosting provider
4. **Use rollback procedures** if necessary

---

## 📞 Support Contacts

### **Technical Support**
- **GitHub Support**: https://support.github.com/
- **SiteGround Support**: 24/7 live chat in Site Tools
- **Stripe Support**: https://support.stripe.com/

### **Emergency Contacts**
- **Technical Lead**: [Your contact information]
- **DevOps Team**: [Team contact information]
- **Security Team**: [Security contact information]

---

## ✅ Setup Complete

Once all secrets are configured and verified:

1. **Test the deployment pipeline**
2. **Verify staging environment works**
3. **Document any custom configurations**
4. **Train team members on the process**

The automated deployment system is now ready for production use!

# GitHub Secrets Setup for midastechnical-wordpress

## 🔐 IMMEDIATE ACTION REQUIRED

After creating the GitHub repository, you need to configure these secrets for the deployment system to work.

### **Access GitHub Secrets**
1. Go to: https://github.com/CorporateGuuu/midastechnical-wordpress/settings/secrets/actions
2. Click "New repository secret" for each secret below

---

## 📋 REQUIRED SECRETS CHECKLIST

### **🏠 SiteGround Hosting Credentials**

#### **Production Environment**
```
Secret Name: SITEGROUND_HOST
Value: [Your SiteGround server IP address]
Example: 192.185.XXX.XXX

Secret Name: SITEGROUND_USERNAME  
Value: [Your SiteGround username]
Example: midastechnical_user

Secret Name: SITEGROUND_PASSWORD
Value: [Your SiteGround password]
Example: [Your secure password]

Secret Name: SITEGROUND_SSH_KEY
Value: [Your private SSH key - full content including headers]
Example: 
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
[... full private key content ...]
-----END OPENSSH PRIVATE KEY-----
```

#### **Staging Environment**
```
Secret Name: SITEGROUND_STAGING_HOST
Value: [Staging server IP or staging URL host]

Secret Name: SITEGROUND_STAGING_USERNAME
Value: [Staging username]

Secret Name: SITEGROUND_STAGING_PASSWORD
Value: [Staging password]

Secret Name: SITEGROUND_STAGING_SSH_KEY
Value: [Staging SSH private key]

Secret Name: STAGING_URL
Value: https://staging-123456.siteground.site
```

### **💾 Database Credentials**

#### **Production Database**
```
Secret Name: DB_USERNAME
Value: [Production database username]

Secret Name: DB_PASSWORD
Value: [Production database password]

Secret Name: DB_NAME
Value: [Production database name]

Secret Name: DB_HOST
Value: localhost
```

#### **Staging Database**
```
Secret Name: STAGING_DB_USERNAME
Value: [Staging database username]

Secret Name: STAGING_DB_PASSWORD
Value: [Staging database password]

Secret Name: STAGING_DB_NAME
Value: [Staging database name]

Secret Name: STAGING_DB_HOST
Value: localhost
```

### **🔑 WordPress Security Keys**

Generate new keys at: https://api.wordpress.org/secret-key/1.1/salt/

```
Secret Name: AUTH_KEY
Value: [Generated auth key]

Secret Name: SECURE_AUTH_KEY
Value: [Generated secure auth key]

Secret Name: LOGGED_IN_KEY
Value: [Generated logged in key]

Secret Name: NONCE_KEY
Value: [Generated nonce key]

Secret Name: AUTH_SALT
Value: [Generated auth salt]

Secret Name: SECURE_AUTH_SALT
Value: [Generated secure auth salt]

Secret Name: LOGGED_IN_SALT
Value: [Generated logged in salt]

Secret Name: NONCE_SALT
Value: [Generated nonce salt]
```

### **💳 Stripe Payment Processing**

#### **Live Stripe Keys**
```
Secret Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_[your_live_publishable_key]

Secret Name: STRIPE_SECRET_KEY
Value: sk_live_[your_live_secret_key]

Secret Name: STRIPE_WEBHOOK_SECRET
Value: whsec_[your_webhook_secret]
```

#### **Test Stripe Keys**
```
Secret Name: STRIPE_TEST_PUBLISHABLE_KEY
Value: pk_test_[your_test_publishable_key]

Secret Name: STRIPE_TEST_SECRET_KEY
Value: sk_test_[your_test_secret_key]

Secret Name: STRIPE_TEST_WEBHOOK_SECRET
Value: whsec_[your_test_webhook_secret]
```

### **📧 Email Configuration**

```
Secret Name: SMTP_USER
Value: noreply@midastechnical.com

Secret Name: SMTP_PASS
Value: [Email password]

Secret Name: STAGING_SMTP_PASS
Value: [Staging email password]

Secret Name: NOTIFICATION_EMAIL
Value: admin@midastechnical.com
```

### **🔔 Optional Notification Secrets**

```
Secret Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/[your_webhook_url]
(Optional - for Slack notifications)
```

---

## 🚀 QUICK SETUP STEPS

### **Step 1: Get SiteGround Information**
1. Login to SiteGround: https://my.siteground.com/
2. Go to Site Tools → Site → Site Information
3. Record: Server IP, Username, Password

### **Step 2: Generate SSH Key**
```bash
# Generate SSH key for deployment
ssh-keygen -t rsa -b 4096 -C "deployment@midastechnical.com" -f ~/.ssh/midastechnical_deploy

# Copy public key to SiteGround
cat ~/.ssh/midastechnical_deploy.pub
# Add this to SiteGround Site Tools → SSH Keys

# Copy private key for GitHub Secret
cat ~/.ssh/midastechnical_deploy
# Use this for SITEGROUND_SSH_KEY secret
```

### **Step 3: Get Database Information**
1. SiteGround Site Tools → MySQL → Databases
2. Record database name, username, password

### **Step 4: Generate WordPress Keys**
1. Visit: https://api.wordpress.org/secret-key/1.1/salt/
2. Copy each generated key to respective secret

### **Step 5: Get Stripe Keys**
1. Login to Stripe Dashboard
2. Developers → API keys
3. Copy live and test keys

---

## ✅ VERIFICATION CHECKLIST

After adding all secrets, verify:

- [ ] All 25+ secrets added to GitHub
- [ ] SSH key added to SiteGround
- [ ] Database credentials tested
- [ ] Stripe keys are correct (live vs test)
- [ ] Email credentials working
- [ ] WordPress keys generated fresh

---

## 🔧 NEXT STEPS AFTER SECRETS SETUP

1. **Export WordPress files from SiteGround**
2. **Add WordPress content to repository**
3. **Test staging deployment**
4. **Test production deployment**
5. **Verify all functionality**

The deployment system will be ready once all secrets are configured!

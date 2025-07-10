# 🔐 WordPress.com SSH Key Setup Guide

## **Complete Guide for SSH/SFTP Access to midastechnical.com**

### **📋 Prerequisites:**
- ✅ WordPress.com Commerce plan (supports SSH)
- ✅ SSH key pair generated (`midastechnical_deploy`)
- ✅ Domain connected to WordPress.com

---

## **🔑 Your SSH Public Key**

**Copy this exact key to add to WordPress.com:**

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDHi4VhDR8z8WyF4jXKAQSIM/QJuwE4R/2CTYzGC4mMUpV7Bwqj64IdwdzoSDqL80sdu6bs+iSJ7DmI329YoRMIlUA8wVscnqyOH3GWbYaJZZGWE8EfPcVKjLTxACCo5ULW/pzeD2+HZaTKWFKcSZNNlAwlhUrI8VpqmHCEfonRq0bdVtuSlYTyARNy7ggLHNCKdlzYapEBkQiZ4dVC5EnUYETUU9MumHfO1ogZ7u765c1FYnzl5VCoR5LtNZu2BkOIdVnFXhKkjn7/SphSpcVzaqaxzobvXQkjzp38L80rXtJ3zRqerkpeh/mq+mvQ+xHDH1Yw3FykV2BdE5ixutJ5O1+gxccJvyQQslh46xgPKiSHDwDQOVSIKwHbsjwOf0ZdrQLmaoJvOSNUijyol6ZaZ4TlZ+NAfROfZZfnWX/cJZAxkGwr4I1K5aEbo+61MWpJyNkY9OtscINQeOAonYpxkwyszhc2ETaaJbU/k7kDVIEDR87+iJjsFnxM7uUhiWpHKi5F+N//L/2hMb8j40BEG8WbCMLpW3cwJk/9JqW1DsRf6Nzn0pWs9CK4DkcNO7aHNGp/niGkgojFrWLUI/LDhq2g0N8hAl9HwV9vVwel/InfCVC4sFqnNGjRQ2eI2dVuCsMqrapM4az7daYBxacd5IpfjQi7q3r2qE3XSObDfw== deployment@midastechnical.com
```

---

## **🚀 Step-by-Step Setup Process**

### **Step 1: Add SSH Key to WordPress.com Account**

1. **Go to WordPress.com Security Settings:**
   ```
   https://wordpress.com/me/security
   ```

2. **Login** with your WordPress.com credentials

3. **Find "SSH Keys" Section:**
   - Scroll down to find "SSH Keys"
   - Click "Add SSH Key"

4. **Add Your Key:**
   - **Key Name**: `Midastechnical Deployment Key`
   - **Public Key**: Paste the SSH key from above
   - **Click**: "Add Key"

### **Step 2: Attach SSH Key to Your Site**

1. **Go to WordPress.com Sites:**
   ```
   https://wordpress.com/sites
   ```

2. **Select Your Site:**
   - Find and click on `midastechnical.com`

3. **Access Site Settings:**
   - Go to: Settings → General
   - Scroll to find "SSH Keys" section

4. **Attach Key:**
   - Select your "Midastechnical Deployment Key"
   - Click "Save Changes"

### **Step 3: Update SSH Configuration**

1. **Edit SSH Config File:**
   ```bash
   nano ~/.ssh/config
   ```

2. **Find the WordPress.com Entry:**
   ```
   # WordPress.com - Midastechnical.com
   Host wordpress-midastechnical
       HostName ssh.atomicsites.net
       User [YOUR_WORDPRESS_USERNAME]
       IdentityFile /Users/apple/.ssh/midastechnical_deploy
       Port 22
       IdentitiesOnly yes
   ```

3. **Replace `[YOUR_WORDPRESS_USERNAME]`:**
   - Replace with your actual WordPress.com username
   - Save the file (Ctrl+X, Y, Enter in nano)

---

## **🧪 Step 4: Test SSH Connection**

### **Test SSH Access:**
```bash
ssh wordpress-midastechnical
```

### **Test SFTP Access:**
```bash
sftp wordpress-midastechnical
```

### **Expected Results:**
- **Successful**: You'll be connected to WordPress.com servers
- **Failed**: Check username, key attachment, and WordPress.com settings

---

## **📁 WordPress.com File Structure**

### **Important Directories:**
```
/srv/htdocs/                    # WordPress root directory
├── wp-content/
│   ├── themes/                 # WordPress themes
│   ├── plugins/                # WordPress plugins
│   ├── uploads/                # Media uploads
│   └── mu-plugins/             # Must-use plugins
├── wp-config.php               # WordPress configuration
├── wp-admin/                   # WordPress admin (read-only)
├── wp-includes/                # WordPress core (read-only)
└── index.php                   # WordPress entry point
```

### **Writable Directories:**
- ✅ `/srv/htdocs/wp-content/themes/`
- ✅ `/srv/htdocs/wp-content/plugins/`
- ✅ `/srv/htdocs/wp-content/uploads/`
- ✅ `/srv/htdocs/wp-content/mu-plugins/`

### **Read-Only Directories:**
- ❌ `/srv/htdocs/wp-admin/`
- ❌ `/srv/htdocs/wp-includes/`
- ❌ WordPress core files

---

## **📋 Common SFTP Commands**

### **Navigation:**
```bash
ls                              # List files
pwd                             # Show current directory
cd wp-content/themes            # Change to themes directory
cd ..                           # Go up one directory
```

### **File Operations:**
```bash
put local-file.php              # Upload file
get remote-file.php             # Download file
put -r local-folder/            # Upload folder recursively
get -r remote-folder/           # Download folder recursively
```

### **Directory Operations:**
```bash
mkdir new-directory             # Create directory
rmdir empty-directory           # Remove empty directory
rm filename.php                 # Delete file
```

### **Permissions:**
```bash
chmod 644 file.php              # Set file permissions
chmod 755 directory/            # Set directory permissions
```

---

## **🛠️ Practical Use Cases**

### **1. Upload Custom Theme:**
```bash
sftp wordpress-midastechnical
cd wp-content/themes
put -r my-custom-theme/
quit
```

### **2. Download Site Backup:**
```bash
sftp wordpress-midastechnical
get -r wp-content/
quit
```

### **3. Upload Plugin:**
```bash
sftp wordpress-midastechnical
cd wp-content/plugins
put -r my-plugin/
quit
```

### **4. Update wp-config.php:**
```bash
sftp wordpress-midastechnical
get wp-config.php               # Download current
# Edit locally, then upload
put wp-config.php
quit
```

---

## **🔒 Security Best Practices**

### **SSH Key Security:**
- ✅ Keep private key secure (never share)
- ✅ Use strong passphrase for key
- ✅ Regularly rotate SSH keys
- ✅ Monitor SSH access logs
- ✅ Use SSH key authentication only

### **File Permissions:**
- **Files**: 644 (readable by owner, group, and others)
- **Directories**: 755 (executable by owner, readable by others)
- **wp-config.php**: 600 (readable by owner only)

### **WordPress.com Specific:**
- ✅ Only upload trusted themes/plugins
- ✅ Backup before making changes
- ✅ Test changes in staging environment
- ✅ Monitor site performance after uploads

---

## **🚨 Troubleshooting**

### **Connection Refused:**
- **Check**: SSH key is added to WordPress.com account
- **Verify**: Key is attached to midastechnical.com site
- **Confirm**: Username is correct in SSH config

### **Permission Denied:**
- **Check**: SSH key permissions (should be 600)
- **Verify**: Public key matches what's in WordPress.com
- **Confirm**: Using correct private key file

### **Host Key Verification Failed:**
```bash
ssh-keygen -R ssh.atomicsites.net
```

### **SFTP Commands Not Working:**
- **Check**: You're in SFTP mode (not SSH)
- **Verify**: File paths are correct
- **Confirm**: You have write permissions to target directory

---

## **📊 Integration with WordPress.com Migration**

### **Current Project Status:**
- ✅ Domain connected to WordPress.com
- ✅ DNS propagation in progress
- ✅ SSH key ready for deployment
- 🔄 Waiting for domain propagation completion

### **SSH Use Cases for Migration:**
1. **Theme Deployment**: Upload custom themes
2. **Plugin Management**: Install/update plugins
3. **Content Migration**: Transfer files and assets
4. **Configuration**: Update wp-config.php settings
5. **Backup/Recovery**: Download site backups

### **Post-Migration Tasks:**
- Upload brand assets via SFTP
- Deploy custom WooCommerce configurations
- Transfer product images efficiently
- Backup WordPress.com site regularly

---

## **🎯 Next Steps**

### **Immediate Actions:**
1. **Add SSH key** to WordPress.com account
2. **Attach key** to midastechnical.com site
3. **Update SSH config** with your username
4. **Test connection** using provided commands

### **After SSH Setup:**
1. **Wait for domain propagation** to complete
2. **Use SSH/SFTP** for WooCommerce setup
3. **Upload brand assets** from merged repository
4. **Deploy custom configurations** as needed

---

**🔐 SSH access will provide secure, efficient file management for your WordPress.com site once domain propagation completes!**

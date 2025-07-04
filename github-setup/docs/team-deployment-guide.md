# Team Deployment Guide for midastechnical.com

## 🎯 Overview

This guide provides comprehensive instructions for the development team to manage WordPress deployments for midastechnical.com using the automated GitHub Actions pipeline.

## 🏗️ Deployment Architecture

### **Environments**
- **Production**: https://midastechnical.com (Live customer-facing site)
- **Staging**: https://staging-[number].siteground.site (Testing environment)
- **Local**: Developer local environments

### **Deployment Flow**
```
Local Development → Staging → Production
     ↓                ↓           ↓
   Feature Branch → staging → main branch
```

---

## 🚀 Daily Deployment Workflow

### **1. Feature Development**

#### **Starting New Feature**
```bash
# Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/new-feature-name

# Make your changes
# ... development work ...

# Commit changes
git add .
git commit -m "feat: add new feature description"
git push origin feature/new-feature-name
```

#### **Testing Locally**
```bash
# Start local WordPress environment
cd wp-content/themes/mdts-theme
npm run dev

# Test functionality
# - Homepage loads correctly
# - Shop functionality works
# - Admin dashboard accessible
```

### **2. Staging Deployment**

#### **Deploy to Staging**
```bash
# Create pull request to staging branch
gh pr create --base staging --title "Feature: New feature name" --body "Description of changes"

# Or merge directly to staging
git checkout staging
git merge feature/new-feature-name
git push origin staging
```

#### **Automatic Staging Deployment**
- GitHub Actions automatically deploys to staging
- Deployment takes 5-10 minutes
- Notification sent when complete

#### **Staging Testing Checklist**
- [ ] Homepage loads correctly
- [ ] Shop functionality works
- [ ] Product pages display properly
- [ ] Checkout process functional
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable

### **3. Production Deployment**

#### **Create Production Pull Request**
```bash
# Create PR from staging to main
git checkout staging
gh pr create --base main --title "Production Release: [Date]" --body "
## Changes in this release:
- Feature 1 description
- Feature 2 description
- Bug fixes

## Testing completed:
- [x] Staging environment tested
- [x] All functionality verified
- [x] Performance acceptable

## Deployment checklist:
- [x] Database backup will be created
- [x] Rollback plan ready
- [x] Team notified of deployment
"
```

#### **Production Deployment Process**
1. **PR Review**: Team member reviews changes
2. **Approval**: PR approved by reviewer
3. **Merge**: PR merged to main branch
4. **Automatic Deployment**: GitHub Actions deploys to production
5. **Verification**: Automated health checks run
6. **Notification**: Team notified of deployment status

---

## 🔧 Advanced Deployment Operations

### **Manual Deployment Commands**

#### **Deploy Specific Environment**
```bash
# Deploy to staging manually
composer deploy-staging

# Deploy to production manually (use with caution)
composer deploy-production
```

#### **Rollback Deployment**
```bash
# Emergency rollback to previous version
./scripts/rollback.sh production

# Rollback to specific backup
./scripts/rollback.sh production 20241220_143000
```

### **WordPress Updates Management**

#### **Automatic Updates**
- WordPress core, plugins, and themes are checked weekly
- Security updates applied automatically to staging
- PR created for production deployment after testing

#### **Manual Update Process**
```bash
# Trigger manual update check
gh workflow run wordpress-updates.yml

# Apply specific type of updates
gh workflow run wordpress-updates.yml -f update_type=security
gh workflow run wordpress-updates.yml -f update_type=plugins
gh workflow run wordpress-updates.yml -f update_type=all
```

### **Database Management**

#### **Create Manual Backup**
```bash
# Create full backup
./scripts/backup.sh production full

# Create database-only backup
./scripts/backup.sh production database
```

#### **Export WordPress Files**
```bash
# Export current WordPress installation
./scripts/export-wordpress.sh production
```

---

## 🔍 Monitoring & Troubleshooting

### **Deployment Status Monitoring**

#### **GitHub Actions Dashboard**
1. Go to repository → Actions tab
2. View current and recent deployments
3. Check deployment logs for any issues

#### **Deployment Notifications**
- Email notifications sent to team
- Slack notifications (if configured)
- GitHub issues created for failures

### **Common Issues & Solutions**

#### **Deployment Failure**
```
Issue: GitHub Actions deployment fails
Solutions:
1. Check Actions logs for specific error
2. Verify GitHub Secrets are current
3. Test SSH connection to SiteGround
4. Check SiteGround server status
5. Retry deployment after fixing issues
```

#### **Site Not Loading After Deployment**
```
Issue: Site returns 500 error or doesn't load
Solutions:
1. Check .htaccess file syntax
2. Verify file permissions (755 for directories, 644 for files)
3. Check WordPress error logs
4. Verify database connection
5. Use rollback if necessary
```

#### **Plugin/Theme Issues**
```
Issue: Plugin or theme causing problems
Solutions:
1. Check WordPress admin for plugin errors
2. Deactivate problematic plugin via admin
3. Check theme compatibility
4. Review recent changes in staging
5. Rollback if critical functionality affected
```

### **Emergency Procedures**

#### **Site Down Emergency**
1. **Immediate Response**:
   ```bash
   # Quick rollback to previous version
   ./scripts/rollback.sh production
   ```

2. **Notify Team**:
   - Post in team chat
   - Email stakeholders
   - Update status page (if applicable)

3. **Investigation**:
   - Check deployment logs
   - Review recent changes
   - Test in staging environment

4. **Resolution**:
   - Fix identified issues
   - Test thoroughly in staging
   - Deploy fix to production

---

## 👥 Team Roles & Responsibilities

### **Developers**
- Create feature branches
- Test changes locally
- Deploy to staging for testing
- Create production PRs
- Fix deployment issues

### **Tech Lead**
- Review production PRs
- Approve production deployments
- Monitor deployment health
- Coordinate emergency responses

### **DevOps/Admin**
- Maintain GitHub Secrets
- Monitor server health
- Manage hosting infrastructure
- Handle emergency rollbacks

---

## 📋 Deployment Checklists

### **Pre-Deployment Checklist**
- [ ] Changes tested locally
- [ ] Staging deployment successful
- [ ] All functionality verified in staging
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Mobile responsiveness checked
- [ ] SEO elements preserved
- [ ] Backup plan ready

### **Post-Deployment Checklist**
- [ ] Homepage loads correctly
- [ ] Shop functionality works
- [ ] Checkout process functional
- [ ] Admin dashboard accessible
- [ ] SSL certificate valid
- [ ] Performance metrics acceptable
- [ ] No error logs generated
- [ ] Team notified of completion

### **Emergency Rollback Checklist**
- [ ] Issue severity assessed
- [ ] Rollback decision made
- [ ] Team notified of rollback
- [ ] Rollback script executed
- [ ] Site functionality verified
- [ ] Root cause investigation started
- [ ] Fix plan developed

---

## 🔒 Security Considerations

### **Access Control**
- Production deployments require PR approval
- GitHub Secrets access limited to necessary workflows
- SSH keys rotated regularly
- Database credentials secured

### **Code Security**
- No sensitive data in repository
- Environment variables for credentials
- Regular security updates applied
- Code review required for production

### **Monitoring**
- Failed login attempts monitored
- Unusual traffic patterns detected
- Security scans run regularly
- Backup integrity verified

---

## 📞 Support & Escalation

### **Internal Support**
- **Tech Lead**: [Contact information]
- **DevOps Team**: [Contact information]
- **Emergency Contact**: [24/7 contact]

### **External Support**
- **SiteGround**: 24/7 live chat in Site Tools
- **GitHub Support**: https://support.github.com/
- **WordPress Community**: https://wordpress.org/support/

### **Escalation Procedures**
1. **Level 1**: Developer attempts resolution
2. **Level 2**: Tech Lead involvement
3. **Level 3**: DevOps team engagement
4. **Level 4**: External support contacted

---

## 📚 Additional Resources

### **Documentation**
- [GitHub Secrets Setup](github-secrets-setup.md)
- [Deployment Guide](deployment.md)
- [Troubleshooting Guide](troubleshooting.md)
- [Development Guide](development.md)

### **Tools & Links**
- **Repository**: https://github.com/CorporateGuuu/midastechnical-wordpress
- **Production Site**: https://midastechnical.com
- **Staging Site**: [Staging URL]
- **SiteGround**: https://my.siteground.com/

### **Training Materials**
- WordPress deployment best practices
- GitHub Actions workflow documentation
- SiteGround hosting management
- Emergency response procedures

---

## ✅ Quick Reference

### **Common Commands**
```bash
# Deploy to staging
git push origin staging

# Create production PR
gh pr create --base main

# Emergency rollback
./scripts/rollback.sh production

# Manual backup
./scripts/backup.sh production

# Check deployment status
gh run list --workflow="Deploy to Production"
```

### **Important URLs**
- **Production**: https://midastechnical.com
- **Staging**: [Staging URL]
- **GitHub Actions**: https://github.com/CorporateGuuu/midastechnical-wordpress/actions
- **SiteGround**: https://my.siteground.com/

This guide ensures all team members can confidently manage WordPress deployments while maintaining security and reliability standards.

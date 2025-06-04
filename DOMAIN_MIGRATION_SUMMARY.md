# Domain Migration Summary: MDTSTech.store → midastechnical.com

## Overview
This document summarizes all the changes made to migrate the project from "MDTSTech.store" to "midastechnical.com".

## Manual Steps Required

### 1. Directory Rename (REQUIRED - Manual Step)
You need to manually rename the root directory:

```bash
cd "/Users/apple/Desktop/Websites Code"
mv "MDTSTech.store" "midastechnical.com"
cd "midastechnical.com"
```

## Files Updated

### Configuration Files
- ✅ `package.json` - Updated name from "mdts-tech-store" to "midastechnical-com"
- ✅ `next.config.js` - Updated images domains from "mdtstech.store" to "midastechnical.com"
- ✅ `next.config 2.js` - Updated images domains (backup config file)
- ✅ `wrangler.toml` - Updated Cloudflare worker names and route comments
- ✅ `netlify-build.sh` - Updated domain references in build script

### Environment Files
- ✅ `.env.local.example` - Updated database name and email domain
- ✅ `.env.example` - Updated email domain
- ✅ `Scripts/fix-security.sh` - Updated database name in generated .env.local

### Firebase Configuration
- ✅ `lib/firebase.js` - Updated default Firebase project IDs and domains

### SEO and Robots
- ✅ `public/robots.txt` - Updated sitemap URL
- ✅ `.next 2/robots.txt` - Updated sitemap URL (backup file)

### Documentation and README Files
- ✅ `admin/README.md` - Updated admin email domain
- ✅ `supabase/README.md` - Updated Netlify site name reference
- ✅ `rename-directory.sh` - Updated script to use new domain

### Integration Files
- ✅ `components/Admin/AdminIntegrations.js` - Updated n8n URL reference

## Environment Variables to Update

When setting up production environment variables, make sure to use the new domain:

### Database
```
DATABASE_URL=postgres://postgres:password@localhost:5432/midastechnical
```

### Email Configuration
```
EMAIL_FROM=noreply@midastechnical.com
```

### Firebase (if using custom domain)
```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=midastechnical-com.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=midastechnical-com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=midastechnical-com.appspot.com
```

### NextAuth URL (for production)
```
NEXTAUTH_URL=https://midastechnical.com
```

## Deployment Configuration Updates

### Netlify
- Update site name in Netlify dashboard to match new domain
- Update custom domain settings to point to midastechnical.com
- Update environment variables in Netlify dashboard

### Cloudflare (if using)
- Update zone settings for new domain
- Update worker routes in `wrangler.toml` with actual domain
- Update DNS settings

### Firebase (if using)
- Create new Firebase project with ID "midastechnical-com" or update existing project
- Update authorized domains in Firebase console
- Update environment variables with new project details

## DNS Configuration Required

1. **Domain Registration**: Ensure midastechnical.com is registered and owned
2. **DNS Records**: Point domain to your hosting provider
3. **SSL Certificate**: Set up SSL for the new domain
4. **CDN Configuration**: Update any CDN settings

## Testing Checklist

After completing the migration:

- [ ] Verify the directory has been renamed manually
- [ ] Test local development server: `npm run dev`
- [ ] Verify all images load correctly
- [ ] Test authentication flows
- [ ] Verify email sending uses new domain
- [ ] Test payment processing (Stripe webhooks may need domain updates)
- [ ] Verify sitemap generation works
- [ ] Test PWA installation
- [ ] Verify all API endpoints work
- [ ] Test admin panel access

## Additional Considerations

### Third-Party Services
You may need to update domain references in:
- Stripe webhook endpoints
- Google OAuth authorized domains
- Social media login providers
- Email service provider settings
- Analytics tracking codes
- Search console verification

### SEO Migration
- Set up 301 redirects from old domain (if applicable)
- Update Google Search Console
- Update sitemap submissions
- Update any external backlinks

## Rollback Plan

If issues occur, you can rollback by:
1. Renaming directory back to "MDTSTech.store"
2. Reverting the configuration files using git
3. Updating DNS back to old domain

## Notes

- All hardcoded domain references have been updated
- Database names have been updated to use "midastechnical" prefix
- Firebase project IDs have been updated to use "midastechnical-com"
- Email addresses now use "@midastechnical.com" domain
- Sitemap URLs have been updated
- PWA manifest and service worker configurations remain compatible

The migration is now ready for testing and deployment to the new domain.

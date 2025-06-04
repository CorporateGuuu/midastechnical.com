#!/usr/bin/env node

/**
 * Domain Update Script
 * Updates all references from mdtstech.store to midastechnical.com
 */

const fs = require('fs');
const path = require('path');

// Files that contain domain references to update
const filesToUpdate = [
  'tests/privacy-page.test.js',
  'utils/chatbotService.js',
  'utils/chatbotTestCases.js',
  'components/AdminLayout.js',
  'components/Footer/Footer.js',
  'components/Footer/EnhancedFooter.js',
  'components/ContactForm/ContactForm.js',
  'components/Chatbot/ChatbotUI.js',
  'components/MobileMenu/MobileMenu.js',
  'components/Account/AccountSidebar.js',
  'components/UnifiedFooter/UnifiedFooter.js',
  'Scripts/update-admin-password.js',
  'pages/return-policy.js',
  'pages/payment-methods.js',
  'pages/auth/register.js',
  'pages/terms.js',
  'pages/trade-off.js',
  'pages/help-center.js',
  'pages/docs/integrations.js',
  'pages/finance.js',
  'pages/checkout/success.js',
  'pages/trademark-disclaimer.js',
  'pages/privacy.js',
  'pages/contact.js',
  'pages/api/chatbot/message.js',
  'pages/careers.js'
];

function updateDomainReferences() {
  console.log('🔄 Updating domain references from mdtstech.store to midastechnical.com...');
  console.log('=' .repeat(80));
  
  let updatedFiles = 0;
  let totalReplacements = 0;
  
  filesToUpdate.forEach(filePath => {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Count occurrences before replacement
      const beforeCount = (content.match(/mdtstech\.store/g) || []).length;
      
      if (beforeCount === 0) {
        console.log(`✅ ${filePath} - No references found`);
        return;
      }
      
      // Replace all occurrences
      const updatedContent = content.replace(/mdtstech\.store/g, 'midastechnical.com');
      
      // Count occurrences after replacement
      const afterCount = (updatedContent.match(/mdtstech\.store/g) || []).length;
      const replacements = beforeCount - afterCount;
      
      if (replacements > 0) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ ${filePath} - Updated ${replacements} reference(s)`);
        updatedFiles++;
        totalReplacements += replacements;
      } else {
        console.log(`⚠️  ${filePath} - No changes made`);
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  });
  
  console.log('=' .repeat(80));
  console.log(`📊 Summary:`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Total replacements: ${totalReplacements}`);
  console.log('');
  
  if (totalReplacements > 0) {
    console.log('✅ Domain references updated successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Test the application locally: npm run dev');
    console.log('   2. Verify all email addresses work correctly');
    console.log('   3. Check all external links and integrations');
    console.log('   4. Update any third-party service configurations');
    console.log('   5. Rebuild the application: npm run build');
  } else {
    console.log('ℹ️  No domain references found to update.');
  }
}

// Run the update
updateDomainReferences();

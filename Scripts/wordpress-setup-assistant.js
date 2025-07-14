#!/usr/bin/env node

/**
 * WordPress.com Setup Assistant
 * Real-time troubleshooting and verification tool
 */

const https = require('https');
const dns = require('dns').promises;
const readline = require('readline');

class WordPressSetupAssistant {
    constructor() {
        this.domain = 'midastechnical.com';
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('🚀 WordPress.com Setup Assistant');
        console.log('=================================\n');
        
        console.log('This assistant will help you through the WordPress.com setup process.');
        console.log('I\'ll check your progress and provide troubleshooting help.\n');
        
        await this.mainMenu();
    }

    async mainMenu() {
        console.log('📋 What would you like to do?');
        console.log('1. Check current site status');
        console.log('2. Verify DNS configuration');
        console.log('3. Test WordPress.com site creation');
        console.log('4. Troubleshoot domain connection');
        console.log('5. Verify WooCommerce setup');
        console.log('6. Test complete site functionality');
        console.log('7. Get WordPress.com support information');
        console.log('0. Exit\n');
        
        const choice = await this.askQuestion('Enter your choice (0-7): ');
        
        switch (choice) {
            case '1': await this.checkSiteStatus(); break;
            case '2': await this.verifyDNS(); break;
            case '3': await this.testSiteCreation(); break;
            case '4': await this.troubleshootDomain(); break;
            case '5': await this.verifyWooCommerce(); break;
            case '6': await this.testCompleteSite(); break;
            case '7': await this.getSupportInfo(); break;
            case '0': 
                console.log('👋 Goodbye! Good luck with your WordPress.com setup!');
                this.rl.close();
                return;
            default:
                console.log('❌ Invalid choice. Please try again.\n');
        }
        
        await this.mainMenu();
    }

    async checkSiteStatus() {
        console.log('\n🔍 Checking site status...\n');
        
        return new Promise((resolve) => {
            const options = {
                hostname: this.domain,
                port: 443,
                path: '/',
                method: 'GET',
                timeout: 15000,
                headers: {
                    'User-Agent': 'WordPress-Setup-Assistant/1.0'
                }
            };
            
            const req = https.request(options, (res) => {
                console.log(`📊 HTTP Status: ${res.statusCode}`);
                console.log(`🔒 SSL: ${res.socket.authorized ? 'Valid' : 'Invalid'}`);
                console.log(`🖥️  Server: ${res.headers.server || 'Unknown'}`);
                
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        if (data.includes('wordpress') || data.includes('wp-')) {
                            console.log('✅ WordPress.com site is working correctly!');
                            console.log('🎉 Your site is live and accessible!');
                        } else {
                            console.log('⚠️ Site is accessible but may not be WordPress.com yet');
                        }
                    } else if (res.statusCode === 404) {
                        console.log('❌ Site returns 404 - WordPress.com site not created yet');
                        console.log('📋 Next step: Create site in WordPress.com dashboard');
                    } else {
                        console.log(`⚠️ Unexpected status code: ${res.statusCode}`);
                    }
                    
                    console.log('');
                    resolve();
                });
            });
            
            req.on('error', (error) => {
                console.log('❌ Site not accessible');
                console.log(`Error: ${error.message}`);
                console.log('');
                resolve();
            });
            
            req.on('timeout', () => {
                console.log('⏰ Site check timed out');
                console.log('This might indicate DNS or connectivity issues');
                console.log('');
                req.destroy();
                resolve();
            });
            
            req.end();
        });
    }

    async verifyDNS() {
        console.log('\n🌐 Verifying DNS configuration...\n');
        
        try {
            const records = await dns.resolve4(this.domain);
            console.log(`📍 A Records found: ${records.join(', ')}`);
            
            const expectedRecords = ['192.0.78.159', '192.0.78.224'];
            const hasCorrectRecords = expectedRecords.every(expected => 
                records.includes(expected)
            );
            
            if (hasCorrectRecords) {
                console.log('✅ DNS correctly configured for WordPress.com');
                console.log('✅ A records point to WordPress.com servers');
            } else {
                console.log('❌ DNS not correctly configured');
                console.log(`Expected: ${expectedRecords.join(', ')}`);
                console.log(`Found: ${records.join(', ')}`);
                console.log('\n🔧 Fix: Update A records to point to WordPress.com');
            }
            
        } catch (error) {
            console.log('❌ DNS resolution failed');
            console.log(`Error: ${error.message}`);
            console.log('\n🔧 Fix: Check domain registrar DNS settings');
        }
        
        console.log('');
    }

    async testSiteCreation() {
        console.log('\n🏗️ Testing WordPress.com site creation status...\n');
        
        console.log('📋 WordPress.com Site Creation Checklist:');
        console.log('==========================================');
        
        const steps = [
            'Access WordPress.com dashboard (https://wordpress.com/)',
            'Login to your WordPress.com account',
            'Click "Create a new site" or "My Sites" → "Add new site"',
            'Enter domain: midastechnical.com',
            'Select Commerce plan (should be already purchased)',
            'Choose business/e-commerce theme',
            'Connect custom domain in site settings',
            'Wait for domain verification (10-30 minutes)'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            const completed = await this.askQuestion(`${i + 1}. ${steps[i]} - Completed? (y/n): `);
            if (completed.toLowerCase() !== 'y') {
                console.log(`⚠️ Please complete step ${i + 1} before continuing`);
                console.log('💡 Tip: This step is required for the site to work\n');
                return;
            }
        }
        
        console.log('✅ All steps completed! Checking if site is live...\n');
        await this.checkSiteStatus();
    }

    async troubleshootDomain() {
        console.log('\n🔧 Domain Connection Troubleshooting...\n');
        
        console.log('Common domain connection issues and solutions:');
        console.log('=============================================\n');
        
        const issues = [
            {
                issue: 'Domain verification fails in WordPress.com',
                solution: 'Wait 15 minutes and try again. DNS changes take time to propagate.'
            },
            {
                issue: 'Domain already in use error',
                solution: 'Check if domain is connected to another WordPress.com site. Disconnect it first.'
            },
            {
                issue: 'SSL certificate not working',
                solution: 'WordPress.com provisions SSL automatically. Wait 30 minutes after domain connection.'
            },
            {
                issue: 'Site shows "Coming Soon" page',
                solution: 'Go to Settings → Privacy and change to "Public" visibility.'
            },
            {
                issue: 'DNS points to WordPress.com but site shows 404',
                solution: 'WordPress.com site not created yet. Complete site creation in dashboard.'
            }
        ];
        
        issues.forEach((item, index) => {
            console.log(`${index + 1}. Issue: ${item.issue}`);
            console.log(`   Solution: ${item.solution}\n`);
        });
        
        const needHelp = await this.askQuestion('Are you experiencing any of these issues? (y/n): ');
        if (needHelp.toLowerCase() === 'y') {
            const issueNum = await this.askQuestion('Which issue number (1-5)? ');
            const issueIndex = parseInt(issueNum) - 1;
            if (issueIndex >= 0 && issueIndex < issues.length) {
                console.log(`\n🎯 Focused help for issue ${issueNum}:`);
                console.log(`Problem: ${issues[issueIndex].issue}`);
                console.log(`Solution: ${issues[issueIndex].solution}\n`);
            }
        }
    }

    async verifyWooCommerce() {
        console.log('\n🛒 WooCommerce Setup Verification...\n');
        
        console.log('WooCommerce setup checklist:');
        console.log('============================\n');
        
        const wooSteps = [
            'WooCommerce plugin installed and activated',
            'Setup wizard completed with store details',
            'Payment gateways configured (Stripe/PayPal)',
            'Shipping zones and rates set up',
            'Product categories created',
            'Products imported from CSV file',
            'Shop page accessible and working',
            'Cart and checkout functionality tested'
        ];
        
        let completedSteps = 0;
        for (let i = 0; i < wooSteps.length; i++) {
            const completed = await this.askQuestion(`${i + 1}. ${wooSteps[i]} - Done? (y/n): `);
            if (completed.toLowerCase() === 'y') {
                completedSteps++;
            }
        }
        
        const percentage = Math.round((completedSteps / wooSteps.length) * 100);
        console.log(`\n📊 WooCommerce setup progress: ${percentage}%`);
        
        if (percentage === 100) {
            console.log('🎉 WooCommerce setup complete!');
        } else {
            console.log(`⚠️ ${wooSteps.length - completedSteps} steps remaining`);
            console.log('📋 Focus on completing the remaining steps\n');
        }
    }

    async testCompleteSite() {
        console.log('\n🧪 Complete Site Functionality Test...\n');
        
        console.log('Testing all site components...');
        
        // Test homepage
        await this.checkSiteStatus();
        
        // Test shop page
        console.log('🛒 Testing shop page...');
        await this.testPage('/shop');
        
        // Test cart functionality
        console.log('🛍️ Testing cart page...');
        await this.testPage('/cart');
        
        console.log('✅ Site functionality test complete!\n');
    }

    async testPage(path) {
        return new Promise((resolve) => {
            const options = {
                hostname: this.domain,
                port: 443,
                path: path,
                method: 'HEAD',
                timeout: 10000
            };
            
            const req = https.request(options, (res) => {
                if (res.statusCode === 200) {
                    console.log(`   ✅ ${path} - Working`);
                } else {
                    console.log(`   ❌ ${path} - Status: ${res.statusCode}`);
                }
                resolve();
            });
            
            req.on('error', () => {
                console.log(`   ❌ ${path} - Not accessible`);
                resolve();
            });
            
            req.on('timeout', () => {
                console.log(`   ⏰ ${path} - Timeout`);
                req.destroy();
                resolve();
            });
            
            req.end();
        });
    }

    async getSupportInfo() {
        console.log('\n📞 WordPress.com Support Information\n');
        
        console.log('🔗 WordPress.com Support Resources:');
        console.log('===================================');
        console.log('• Dashboard: https://wordpress.com/');
        console.log('• Support: https://wordpress.com/support/');
        console.log('• Live Chat: Available 24/7 for Commerce plans');
        console.log('• Documentation: https://wordpress.com/support/getting-started/');
        console.log('• WooCommerce Docs: https://docs.woocommerce.com/\n');
        
        console.log('📋 Information to provide to support:');
        console.log('=====================================');
        console.log('• Domain: midastechnical.com');
        console.log('• Plan: Commerce');
        console.log('• Issue: Setting up custom domain for e-commerce site');
        console.log('• DNS: Already configured to point to WordPress.com');
        console.log('• Goal: Migrate from Netlify to WordPress.com\n');
        
        console.log('🎯 Quick support request template:');
        console.log('==================================');
        console.log('"I need help connecting my custom domain midastechnical.com to a new WordPress.com site.');
        console.log('I have a Commerce plan and the DNS A records are already pointing to WordPress.com servers');
        console.log('(192.0.78.159, 192.0.78.224). I need to create the site and connect the domain."\n');
    }

    askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }
}

// Run the assistant if this script is executed directly
if (require.main === module) {
    const assistant = new WordPressSetupAssistant();
    assistant.start().catch(console.error);
}

module.exports = WordPressSetupAssistant;

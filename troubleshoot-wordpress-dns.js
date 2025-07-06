#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class WordPressDNSTroubleshooter {
    constructor() {
        this.domain = 'midastechnical.com';
        this.expectedWordPressIPs = ['192.0.78.159', '192.0.78.224'];
        this.currentWordPressIPs = ['192.0.78.13', '192.0.78.12']; // Previous WordPress.com IPs
    }

    async checkCurrentDNS() {
        console.log('🔍 WordPress.com DNS Troubleshooter');
        console.log('='.repeat(60));

        try {
            // Check current A records
            const { stdout } = await execAsync(`nslookup ${this.domain}`);
            const lines = stdout.split('\n');
            const addresses = lines
                .filter(line => line.includes('Address:') && !line.includes('#'))
                .map(line => line.split('Address:')[1]?.trim())
                .filter(Boolean);

            console.log(`\n📍 Current A Records for ${this.domain}:`);
            addresses.forEach(ip => console.log(`   → ${ip}`));

            // Check if pointing to any WordPress.com servers
            const hasExpectedIPs = this.expectedWordPressIPs.some(ip => addresses.includes(ip));
            const hasAlternativeIPs = this.currentWordPressIPs.some(ip => addresses.includes(ip));

            if (hasExpectedIPs) {
                console.log('✅ DNS pointing to expected WordPress.com servers');
                return 'correct';
            } else if (hasAlternativeIPs) {
                console.log('⚠️  DNS pointing to alternative WordPress.com servers');
                console.log('   This may be normal - WordPress.com uses multiple IP ranges');
                return 'alternative';
            } else {
                console.log('❌ DNS not pointing to WordPress.com servers');
                return 'incorrect';
            }

        } catch (error) {
            console.log('❌ DNS lookup failed:', error.message);
            return 'error';
        }
    }

    async checkWebsiteResponse() {
        console.log('\n🌐 Testing Website Response:');

        try {
            const { stdout } = await execAsync(`curl -I -s -w "%{http_code}" https://${this.domain}`);
            const lines = stdout.split('\n');
            const statusCode = lines[lines.length - 1];

            console.log(`   Status Code: ${statusCode}`);

            // Check for server header
            const serverHeader = lines.find(line => line.toLowerCase().startsWith('server:'));
            if (serverHeader) {
                console.log(`   Server: ${serverHeader.split(':')[1]?.trim()}`);
            }

            if (statusCode === '200') {
                console.log('✅ Website loading successfully');
                return 'success';
            } else if (statusCode === '404') {
                console.log('⚠️  Website returns 404 - may be WordPress.com default page');
                return 'wordpress_default';
            } else {
                console.log(`❌ Website error: HTTP ${statusCode}`);
                return 'error';
            }

        } catch (error) {
            console.log('❌ Website test failed:', error.message);
            return 'error';
        }
    }

    async checkPropagation() {
        console.log('\n🌍 Checking Global DNS Propagation:');

        const dnsServers = [
            { name: 'Google', ip: '8.8.8.8' },
            { name: 'Cloudflare', ip: '1.1.1.1' },
            { name: 'OpenDNS', ip: '208.67.222.222' }
        ];

        let propagatedCount = 0;

        for (const server of dnsServers) {
            try {
                const { stdout } = await execAsync(`nslookup ${this.domain} ${server.ip}`);
                const hasWordPressIP = this.expectedWordPressIPs.some(ip => stdout.includes(ip)) ||
                    this.currentWordPressIPs.some(ip => stdout.includes(ip));

                if (hasWordPressIP) {
                    console.log(`   ✅ ${server.name} (${server.ip}): WordPress.com IP found`);
                    propagatedCount++;
                } else {
                    console.log(`   ❌ ${server.name} (${server.ip}): No WordPress.com IP`);
                }
            } catch (error) {
                console.log(`   ❌ ${server.name} (${server.ip}): Query failed`);
            }
        }

        const propagationPercent = Math.round((propagatedCount / dnsServers.length) * 100);
        console.log(`\n📊 Global Propagation: ${propagationPercent}% (${propagatedCount}/${dnsServers.length} servers)`);

        return propagationPercent;
    }

    async generateRecommendations(dnsStatus, websiteStatus, propagation) {
        console.log('\n💡 TROUBLESHOOTING RECOMMENDATIONS');
        console.log('='.repeat(60));

        if (dnsStatus === 'correct' && websiteStatus === 'success') {
            console.log('🎉 Everything looks good! DNS and website are working correctly.');
            return;
        }

        if (dnsStatus === 'alternative') {
            console.log('📝 DNS Status: Alternative WordPress.com IPs detected');
            console.log('   → This is likely normal - WordPress.com uses multiple IP ranges');
            console.log('   → Monitor for 2-4 hours to see if it switches to expected IPs');
            console.log('   → If website loads correctly, no action needed');
        }

        if (dnsStatus === 'incorrect') {
            console.log('🔧 DNS Issue: Records not pointing to WordPress.com');
            console.log('   → Check WordPress.com dashboard for domain status');
            console.log('   → Verify BIND file import was successful');
            console.log('   → Manually add DNS records if import failed');
            console.log('   → Contact WordPress.com support for assistance');
        }

        if (websiteStatus === 'wordpress_default') {
            console.log('🔧 Website Issue: WordPress.com default page (404)');
            console.log('   → This is normal during initial setup');
            console.log('   → Complete WordPress.com site setup');
            console.log('   → Add content or install theme');
        }

        if (propagation < 50) {
            console.log('⏰ Propagation Issue: DNS changes still spreading');
            console.log('   → Wait 2-4 more hours for WordPress.com propagation');
            console.log('   → Global propagation can take up to 48 hours');
            console.log('   → Use online tools: whatsmydns.net, dnschecker.org');
        }

        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Check WordPress.com dashboard domain status');
        console.log('2. Verify all DNS records are present and correct');
        console.log('3. Wait for propagation if records are correct');
        console.log('4. Contact WordPress.com support if issues persist');
        console.log('5. Proceed with e-commerce setup once domain is working');
    }

    async run() {
        const dnsStatus = await this.checkCurrentDNS();
        const websiteStatus = await this.checkWebsiteResponse();
        const propagation = await this.checkPropagation();

        await this.generateRecommendations(dnsStatus, websiteStatus, propagation);
    }
}

// Run the troubleshooter
const troubleshooter = new WordPressDNSTroubleshooter();
troubleshooter.run().catch(console.error);

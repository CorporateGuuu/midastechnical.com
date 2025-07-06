#!/usr/bin/env node

/**
 * DNS Verification Script for WordPress.com Migration
 * Checks DNS propagation and WordPress.com connectivity
 */

const { exec } = require('child_process');
const https = require('https');
const util = require('util');

const execAsync = util.promisify(exec);

class DNSVerifier {
  constructor() {
    this.domain = 'midastechnical.com';
    this.expectedIPs = ['192.0.78.159', '192.0.78.224'];
    this.results = {
      aRecords: { status: 'pending', details: [] },
      cnameRecords: { status: 'pending', details: [] },
      txtRecords: { status: 'pending', details: [] },
      websiteAccess: { status: 'pending', details: [] },
      propagation: { status: 'pending', details: [] }
    };
  }

  /**
   * Main verification process
   */
  async runVerification() {
    console.log('🔍 Starting DNS verification for midastechnical.com\n');
    console.log('='.repeat(60));

    try {
      await this.checkARecords();
      await this.checkCNAMERecords();
      await this.checkTXTRecords();
      await this.checkWebsiteAccess();
      await this.checkGlobalPropagation();

      this.displaySummary();
      this.provideRecommendations();

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
    }
  }

  /**
   * Check A records for WordPress.com IPs
   */
  async checkARecords() {
    console.log('🔍 Checking A Records...');

    try {
      const { stdout } = await execAsync(`nslookup ${this.domain}`);
      const lines = stdout.split('\n');
      const addresses = lines
        .filter(line => line.includes('Address:'))
        .map(line => line.split('Address:')[1]?.trim())
        .filter(addr => addr && !addr.includes('#'));

      console.log(`   Found IP addresses: ${addresses.join(', ')}`);

      const hasWordPressIPs = this.expectedIPs.some(ip => addresses.includes(ip));

      if (hasWordPressIPs) {
        this.results.aRecords.status = 'success';
        this.results.aRecords.details = addresses;
        console.log('   ✅ A records point to WordPress.com servers');
      } else {
        this.results.aRecords.status = 'error';
        this.results.aRecords.details = addresses;
        console.log('   ❌ A records do not point to WordPress.com servers');
        console.log(`   Expected: ${this.expectedIPs.join(' or ')}`);
      }

    } catch (error) {
      this.results.aRecords.status = 'error';
      this.results.aRecords.details = [error.message];
      console.log('   ❌ Failed to check A records:', error.message);
    }

    console.log('');
  }

  /**
   * Check CNAME records
   */
  async checkCNAMERecords() {
    console.log('🔍 Checking CNAME Records...');

    try {
      const { stdout } = await execAsync(`nslookup www.${this.domain}`);

      if (stdout.includes('canonical name') || stdout.includes('CNAME')) {
        this.results.cnameRecords.status = 'success';
        console.log('   ✅ www CNAME record is configured');
      } else {
        this.results.cnameRecords.status = 'warning';
        console.log('   ⚠️  www CNAME record may not be configured');
      }

    } catch (error) {
      this.results.cnameRecords.status = 'error';
      console.log('   ❌ Failed to check CNAME records:', error.message);
    }

    console.log('');
  }

  /**
   * Check TXT records for email authentication
   */
  async checkTXTRecords() {
    console.log('🔍 Checking TXT Records (Email Authentication)...');

    try {
      // Check SPF record
      const { stdout: spfResult } = await execAsync(`nslookup -type=TXT ${this.domain}`);
      const hasSPF = spfResult.includes('_spf.wpcloud.com');

      if (hasSPF) {
        console.log('   ✅ SPF record found for WordPress.com');
      } else {
        console.log('   ❌ SPF record not found or incorrect');
      }

      // Check DMARC record
      try {
        const { stdout: dmarcResult } = await execAsync(`nslookup -type=TXT _dmarc.${this.domain}`);
        const hasDMARC = dmarcResult.includes('DMARC1');

        if (hasDMARC) {
          console.log('   ✅ DMARC record found');
        } else {
          console.log('   ❌ DMARC record not found');
        }
      } catch (dmarcError) {
        console.log('   ❌ DMARC record not found');
      }

      this.results.txtRecords.status = hasSPF ? 'success' : 'warning';

    } catch (error) {
      this.results.txtRecords.status = 'error';
      console.log('   ❌ Failed to check TXT records:', error.message);
    }

    console.log('');
  }

  /**
   * Check website accessibility
   */
  async checkWebsiteAccess() {
    console.log('🔍 Checking Website Access...');

    return new Promise((resolve) => {
      const options = {
        hostname: this.domain,
        port: 443,
        path: '/',
        method: 'GET',
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        console.log(`   HTTP Status: ${res.statusCode}`);
        console.log(`   Server: ${res.headers.server || 'Unknown'}`);

        if (res.statusCode === 200) {
          this.results.websiteAccess.status = 'success';
          console.log('   ✅ Website is accessible');
        } else if (res.statusCode === 404) {
          this.results.websiteAccess.status = 'warning';
          console.log('   ⚠️  Website returns 404 - may still be setting up');
        } else {
          this.results.websiteAccess.status = 'error';
          console.log(`   ❌ Website returns ${res.statusCode}`);
        }

        resolve();
      });

      req.on('error', (error) => {
        this.results.websiteAccess.status = 'error';
        console.log('   ❌ Website not accessible:', error.message);
        resolve();
      });

      req.on('timeout', () => {
        this.results.websiteAccess.status = 'error';
        console.log('   ❌ Website request timed out');
        req.destroy();
        resolve();
      });

      req.end();
    });
  }

  /**
   * Check global DNS propagation
   */
  async checkGlobalPropagation() {
    console.log('🔍 Checking Global DNS Propagation...');
    console.log('   Note: This is a simplified check. Use online tools for comprehensive verification.');

    const dnsServers = [
      '8.8.8.8',      // Google
      '1.1.1.1',      // Cloudflare
      '208.67.222.222' // OpenDNS
    ];

    let successCount = 0;

    for (const server of dnsServers) {
      try {
        const { stdout } = await execAsync(`nslookup ${this.domain} ${server}`);
        const hasWordPressIP = this.expectedIPs.some(ip => stdout.includes(ip));

        if (hasWordPressIP) {
          successCount++;
          console.log(`   ✅ ${server}: WordPress.com IP found`);
        } else {
          console.log(`   ❌ ${server}: WordPress.com IP not found`);
        }
      } catch (error) {
        console.log(`   ❌ ${server}: Query failed`);
      }
    }

    const propagationPercentage = (successCount / dnsServers.length) * 100;
    console.log(`   📊 Propagation: ${propagationPercentage.toFixed(0)}% (${successCount}/${dnsServers.length} servers)`);

    if (propagationPercentage >= 66) {
      this.results.propagation.status = 'success';
    } else if (propagationPercentage >= 33) {
      this.results.propagation.status = 'warning';
    } else {
      this.results.propagation.status = 'error';
    }

    console.log('');
  }

  /**
   * Display verification summary
   */
  displaySummary() {
    console.log('='.repeat(60));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(60));

    const checks = [
      { name: 'A Records (WordPress.com IPs)', result: this.results.aRecords },
      { name: 'CNAME Records (www subdomain)', result: this.results.cnameRecords },
      { name: 'TXT Records (Email auth)', result: this.results.txtRecords },
      { name: 'Website Accessibility', result: this.results.websiteAccess },
      { name: 'Global DNS Propagation', result: this.results.propagation }
    ];

    checks.forEach(check => {
      const icon = check.result.status === 'success' ? '✅' :
        check.result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${check.name}: ${check.result.status.toUpperCase()}`);
    });

    console.log('');
  }

  /**
   * Provide recommendations based on results
   */
  provideRecommendations() {
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(60));

    if (this.results.aRecords.status !== 'success') {
      console.log('🔧 A Records Issue:');
      console.log('   - Update A records to point to 192.0.78.159 and 192.0.78.224');
      console.log('   - Delete any existing A records pointing to other IPs');
      console.log('   - Wait 24-48 hours for full propagation\n');
    }

    if (this.results.websiteAccess.status === 'error') {
      console.log('🔧 Website Access Issue:');
      console.log('   - Verify DNS changes have been saved');
      console.log('   - Check WordPress.com dashboard for domain connection status');
      console.log('   - Contact WordPress.com support if DNS is correct\n');
    }

    if (this.results.txtRecords.status !== 'success') {
      console.log('🔧 Email Authentication Issue:');
      console.log('   - Add SPF record: "v=spf1 include:_spf.wpcloud.com ~all"');
      console.log('   - Add DMARC record: "v=DMARC1;p=none;"');
      console.log('   - Add DKIM CNAME records as specified in the guide\n');
    }

    if (this.results.propagation.status !== 'success') {
      console.log('🔧 DNS Propagation Issue:');
      console.log('   - DNS changes are still propagating globally');
      console.log('   - Wait additional time (up to 48 hours total)');
      console.log('   - Use online tools: whatsmydns.net, dnschecker.org\n');
    }

    console.log('🌐 Online Verification Tools:');
    console.log('   - https://whatsmydns.net');
    console.log('   - https://dnschecker.org');
    console.log('   - https://mxtoolbox.com');
    console.log('');

    console.log('📞 Next Steps:');
    if (this.results.aRecords.status === 'success' && this.results.websiteAccess.status === 'success') {
      console.log('   ✅ DNS is working! Proceed to WordPress.com eCommerce setup.');
    } else {
      console.log('   ⏳ Wait for DNS propagation, then run this script again.');
      console.log('   📧 Contact your DNS provider if changes won\'t save.');
    }
  }
}

// Run verification if script is executed directly
if (require.main === module) {
  const verifier = new DNSVerifier();
  verifier.runVerification();
}

module.exports = DNSVerifier;

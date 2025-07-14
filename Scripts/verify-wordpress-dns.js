#!/usr/bin/env node

/**
 * WordPress.com DNS Verification Script
 * Verifies DNS configuration for midastechnical.com WordPress.com hosting
 */

const dns = require('dns').promises;
const https = require('https');
const { promisify } = require('util');

class WordPressDNSVerifier {
    constructor() {
        this.domain = 'midastechnical.com';
        this.expectedARecords = ['192.0.78.159', '192.0.78.224'];
        this.results = {
            aRecords: { status: 'pending', records: [] },
            ssl: { status: 'pending', details: {} },
            email: { status: 'pending', records: {} },
            accessibility: { status: 'pending', response: null }
        };
    }

    async verifyAll() {
        console.log(`🔍 Starting DNS verification for ${this.domain}`);
        console.log('=' * 50);
        
        try {
            await this.checkARecords();
            await this.checkSSLCertificate();
            await this.checkEmailRecords();
            await this.checkSiteAccessibility();
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Verification failed:', error.message);
            throw error;
        }
    }

    async checkARecords() {
        console.log('📍 Checking A records...');
        
        try {
            const records = await dns.resolve4(this.domain);
            this.results.aRecords.records = records;
            
            console.log(`Found A records: ${records.join(', ')}`);
            
            // Check if WordPress.com A records are present
            const hasWordPressRecords = this.expectedARecords.every(expected => 
                records.includes(expected)
            );
            
            if (hasWordPressRecords) {
                this.results.aRecords.status = 'success';
                console.log('✅ WordPress.com A records configured correctly');
            } else {
                this.results.aRecords.status = 'warning';
                console.log('⚠️ WordPress.com A records not found or incomplete');
                console.log(`Expected: ${this.expectedARecords.join(', ')}`);
                console.log(`Found: ${records.join(', ')}`);
            }
            
        } catch (error) {
            this.results.aRecords.status = 'error';
            console.log('❌ Failed to resolve A records:', error.message);
        }
    }

    async checkSSLCertificate() {
        console.log('🔒 Checking SSL certificate...');
        
        return new Promise((resolve) => {
            const options = {
                hostname: this.domain,
                port: 443,
                method: 'HEAD',
                timeout: 10000
            };
            
            const req = https.request(options, (res) => {
                const cert = res.socket.getPeerCertificate();
                
                this.results.ssl.details = {
                    issuer: cert.issuer?.CN || 'Unknown',
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    subject: cert.subject?.CN || 'Unknown'
                };
                
                if (cert.valid_from && cert.valid_to) {
                    const now = new Date();
                    const validFrom = new Date(cert.valid_from);
                    const validTo = new Date(cert.valid_to);
                    
                    if (now >= validFrom && now <= validTo) {
                        this.results.ssl.status = 'success';
                        console.log('✅ SSL certificate is valid');
                        console.log(`Issuer: ${cert.issuer?.CN}`);
                        console.log(`Valid until: ${cert.valid_to}`);
                    } else {
                        this.results.ssl.status = 'error';
                        console.log('❌ SSL certificate is expired or not yet valid');
                    }
                } else {
                    this.results.ssl.status = 'warning';
                    console.log('⚠️ Could not verify SSL certificate validity');
                }
                
                resolve();
            });
            
            req.on('error', (error) => {
                this.results.ssl.status = 'error';
                console.log('❌ SSL check failed:', error.message);
                resolve();
            });
            
            req.on('timeout', () => {
                this.results.ssl.status = 'error';
                console.log('❌ SSL check timed out');
                req.destroy();
                resolve();
            });
            
            req.end();
        });
    }

    async checkEmailRecords() {
        console.log('📧 Checking email DNS records...');
        
        try {
            // Check SPF record
            const txtRecords = await dns.resolveTxt(this.domain);
            const spfRecord = txtRecords.find(record => 
                record.join('').includes('v=spf1') && record.join('').includes('_spf.wpcloud.com')
            );
            
            if (spfRecord) {
                this.results.email.spf = 'configured';
                console.log('✅ SPF record found for WordPress.com');
            } else {
                this.results.email.spf = 'missing';
                console.log('⚠️ WordPress.com SPF record not found');
            }
            
            // Check DKIM records
            try {
                const dkim1 = await dns.resolveCname(`dkim1._domainkey.${this.domain}`);
                const dkim2 = await dns.resolveCname(`dkim2._domainkey.${this.domain}`);
                
                if (dkim1.some(record => record.includes('wpcloud.com')) && 
                    dkim2.some(record => record.includes('wpcloud.com'))) {
                    this.results.email.dkim = 'configured';
                    console.log('✅ DKIM records configured for WordPress.com');
                } else {
                    this.results.email.dkim = 'partial';
                    console.log('⚠️ DKIM records found but may not be WordPress.com');
                }
            } catch (error) {
                this.results.email.dkim = 'missing';
                console.log('⚠️ DKIM records not found');
            }
            
            // Check DMARC record
            try {
                const dmarcRecords = await dns.resolveTxt(`_dmarc.${this.domain}`);
                const dmarcRecord = dmarcRecords.find(record => 
                    record.join('').includes('v=DMARC1')
                );
                
                if (dmarcRecord) {
                    this.results.email.dmarc = 'configured';
                    console.log('✅ DMARC record found');
                } else {
                    this.results.email.dmarc = 'missing';
                    console.log('⚠️ DMARC record not found');
                }
            } catch (error) {
                this.results.email.dmarc = 'missing';
                console.log('⚠️ DMARC record not found');
            }
            
            this.results.email.status = 'checked';
            
        } catch (error) {
            this.results.email.status = 'error';
            console.log('❌ Email DNS check failed:', error.message);
        }
    }

    async checkSiteAccessibility() {
        console.log('🌐 Checking site accessibility...');
        
        return new Promise((resolve) => {
            const options = {
                hostname: this.domain,
                port: 443,
                path: '/',
                method: 'GET',
                timeout: 15000,
                headers: {
                    'User-Agent': 'WordPress-DNS-Verifier/1.0'
                }
            };
            
            const req = https.request(options, (res) => {
                this.results.accessibility.response = {
                    statusCode: res.statusCode,
                    headers: {
                        server: res.headers.server,
                        'x-powered-by': res.headers['x-powered-by'],
                        'content-type': res.headers['content-type']
                    }
                };
                
                if (res.statusCode === 200) {
                    this.results.accessibility.status = 'success';
                    console.log('✅ Site is accessible via HTTPS');
                    console.log(`Status: ${res.statusCode}`);
                    if (res.headers.server) {
                        console.log(`Server: ${res.headers.server}`);
                    }
                } else if (res.statusCode >= 300 && res.statusCode < 400) {
                    this.results.accessibility.status = 'redirect';
                    console.log(`🔄 Site redirects (${res.statusCode})`);
                } else {
                    this.results.accessibility.status = 'error';
                    console.log(`❌ Site returned error: ${res.statusCode}`);
                }
                
                resolve();
            });
            
            req.on('error', (error) => {
                this.results.accessibility.status = 'error';
                console.log('❌ Site accessibility check failed:', error.message);
                resolve();
            });
            
            req.on('timeout', () => {
                this.results.accessibility.status = 'timeout';
                console.log('❌ Site accessibility check timed out');
                req.destroy();
                resolve();
            });
            
            req.end();
        });
    }

    generateReport() {
        console.log('\n' + '=' * 50);
        console.log('📊 DNS VERIFICATION REPORT');
        console.log('=' * 50);
        
        console.log(`\n🌐 Domain: ${this.domain}`);
        console.log(`📅 Checked: ${new Date().toISOString()}`);
        
        console.log('\n📍 A RECORDS:');
        console.log(`Status: ${this.getStatusIcon(this.results.aRecords.status)}`);
        console.log(`Records: ${this.results.aRecords.records.join(', ')}`);
        
        console.log('\n🔒 SSL CERTIFICATE:');
        console.log(`Status: ${this.getStatusIcon(this.results.ssl.status)}`);
        if (this.results.ssl.details.issuer) {
            console.log(`Issuer: ${this.results.ssl.details.issuer}`);
            console.log(`Valid until: ${this.results.ssl.details.validTo}`);
        }
        
        console.log('\n📧 EMAIL RECORDS:');
        console.log(`SPF: ${this.getStatusIcon(this.results.email.spf === 'configured' ? 'success' : 'warning')}`);
        console.log(`DKIM: ${this.getStatusIcon(this.results.email.dkim === 'configured' ? 'success' : 'warning')}`);
        console.log(`DMARC: ${this.getStatusIcon(this.results.email.dmarc === 'configured' ? 'success' : 'warning')}`);
        
        console.log('\n🌐 SITE ACCESSIBILITY:');
        console.log(`Status: ${this.getStatusIcon(this.results.accessibility.status)}`);
        if (this.results.accessibility.response) {
            console.log(`HTTP Status: ${this.results.accessibility.response.statusCode}`);
        }
        
        // Overall status
        const overallStatus = this.calculateOverallStatus();
        console.log(`\n🎯 OVERALL STATUS: ${this.getStatusIcon(overallStatus)}`);
        
        if (overallStatus === 'success') {
            console.log('\n✅ WordPress.com DNS configuration is complete and working!');
        } else {
            console.log('\n⚠️ Some issues found. Check the details above.');
        }
        
        // Save report to file
        this.saveReport();
    }

    getStatusIcon(status) {
        switch (status) {
            case 'success': return '✅ Success';
            case 'warning': return '⚠️ Warning';
            case 'error': return '❌ Error';
            case 'redirect': return '🔄 Redirect';
            case 'timeout': return '⏰ Timeout';
            default: return '❓ Unknown';
        }
    }

    calculateOverallStatus() {
        const statuses = [
            this.results.aRecords.status,
            this.results.ssl.status,
            this.results.accessibility.status
        ];
        
        if (statuses.includes('error')) return 'error';
        if (statuses.includes('warning')) return 'warning';
        return 'success';
    }

    saveReport() {
        const report = {
            domain: this.domain,
            timestamp: new Date().toISOString(),
            results: this.results,
            overallStatus: this.calculateOverallStatus()
        };
        
        const fs = require('fs');
        fs.writeFileSync(`dns-verification-${Date.now()}.json`, JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to dns-verification-*.json');
    }
}

// Run verification if this script is executed directly
if (require.main === module) {
    const verifier = new WordPressDNSVerifier();
    verifier.verifyAll().catch(console.error);
}

module.exports = WordPressDNSVerifier;

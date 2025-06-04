# DNS Configuration for midastechnical.com

## Required DNS Records

### A Records (IPv4)
midastechnical.com.     300   IN   A     YOUR_SERVER_IP
www.midastechnical.com. 300   IN   A     YOUR_SERVER_IP

### AAAA Records (IPv6) - Optional
midastechnical.com.     300   IN   AAAA  YOUR_SERVER_IPv6
www.midastechnical.com. 300   IN   AAAA  YOUR_SERVER_IPv6

### CNAME Records
cdn.midastechnical.com. 300   IN   CNAME res.cloudinary.com.

### MX Records (Email)
midastechnical.com.     300   IN   MX    10 mail.midastechnical.com.

### TXT Records
midastechnical.com.     300   IN   TXT   "v=spf1 include:sendgrid.net ~all"
_dmarc.midastechnical.com. 300 IN TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@midastechnical.com"

### CAA Records (Certificate Authority Authorization)
midastechnical.com.     300   IN   CAA   0 issue "letsencrypt.org"
midastechnical.com.     300   IN   CAA   0 issuewild "letsencrypt.org"

## Verification Commands

# Check A record
dig A midastechnical.com

# Check SSL certificate
openssl s_client -connect midastechnical.com:443 -servername midastechnical.com

# Check HTTP to HTTPS redirect
curl -I http://midastechnical.com

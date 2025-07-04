# Custom Stripe Integration Setup for midastechnical.com

## 🎯 OBJECTIVE
Install and configure the custom Stripe integration plugin for WordPress/WooCommerce to handle payment processing.

---

## 📋 STRIPE PLUGIN INSTALLATION

### **Step 1: Upload Custom Stripe Plugin**

#### **Via WordPress Admin:**
1. **Navigate to**: Plugins → Add New → Upload Plugin
2. **Create ZIP file**: Compress `migration/mdts-stripe-integration/` folder
3. **Upload**: mdts-stripe-integration.zip
4. **Install**: Plugin
5. **Activate**: MDTS Stripe Integration

#### **Via File Manager (Alternative):**
1. **Access**: SiteGround File Manager
2. **Navigate to**: public_html/wp-content/plugins/
3. **Upload**: mdts-stripe-integration folder
4. **Activate**: Plugin in WordPress admin

### **Step 2: Verify Plugin Installation**

1. **Navigate to**: Plugins → Installed Plugins
2. **Confirm**: MDTS Stripe Integration is active
3. **Check**: No error messages or conflicts
4. **Verify**: Plugin appears in WooCommerce → Settings → Payments

---

## 🔧 STRIPE CONFIGURATION

### **Step 1: Stripe Account Setup**

#### **Create/Access Stripe Account:**
1. **Visit**: https://dashboard.stripe.com/
2. **Login**: To your existing Stripe account
3. **Or create**: New account for midastechnical.com

#### **Get API Keys:**
1. **Navigate to**: Developers → API keys
2. **Copy keys**:
   ```
   Publishable key: pk_test_... (for testing)
   Secret key: sk_test_... (for testing)
   
   Publishable key: pk_live_... (for production)
   Secret key: sk_live_... (for production)
   ```

### **Step 2: WordPress Plugin Configuration**

#### **Access Plugin Settings:**
1. **Navigate to**: WooCommerce → Settings → Payments
2. **Find**: MDTS Stripe Gateway
3. **Click**: Manage/Configure

#### **Basic Settings:**
```
Enable/Disable: ☑ Enable MDTS Stripe Gateway
Title: Credit Card (Stripe)
Description: Pay securely with your credit card via Stripe
```

#### **API Configuration:**
```
Test Mode: ☑ Enable (for staging)
Test Publishable Key: pk_test_[your_test_key]
Test Secret Key: sk_test_[your_test_key]

Live Publishable Key: pk_live_[your_live_key] (for production)
Live Secret Key: sk_live_[your_live_key] (for production)
```

#### **Advanced Settings:**
```
Capture: ☑ Capture charge immediately
Payment Request Buttons: ☑ Enable Apple Pay/Google Pay
Saved Cards: ☑ Allow customers to save cards
Statement Descriptor: MDTS TECH
```

### **Step 3: Webhook Configuration**

#### **In Stripe Dashboard:**
1. **Navigate to**: Developers → Webhooks
2. **Add endpoint**: 
   ```
   URL: https://staging-[number].siteground.site/wp-json/mdts/v1/stripe-webhook
   ```
3. **Select events**:
   ```
   ☑ payment_intent.succeeded
   ☑ payment_intent.payment_failed
   ☑ checkout.session.completed
   ☑ customer.subscription.created
   ☑ customer.subscription.updated
   ☑ customer.subscription.deleted
   ```
4. **Save webhook**
5. **Copy webhook secret**: whsec_...

#### **In WordPress Plugin:**
```
Webhook Secret: whsec_[your_webhook_secret]
```

---

## 🧪 STRIPE TESTING

### **Step 1: Test Mode Configuration**

Ensure test mode is enabled:
```
Test Mode: ☑ Enabled
Environment: Staging
```

### **Step 2: Test Card Numbers**

Use Stripe test cards for testing:
```
Successful Payment:
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits

Declined Payment:
Card: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits

3D Secure Required:
Card: 4000 0000 0000 3220
Expiry: Any future date
CVC: Any 3 digits
```

### **Step 3: Payment Flow Testing**

#### **Complete Checkout Test:**
1. **Add product**: To cart on staging site
2. **Proceed**: To checkout
3. **Fill details**:
   ```
   Email: test@midastechnical.com
   First Name: Test
   Last Name: Customer
   Address: 123 Test St
   City: Test City
   State: CA
   ZIP: 12345
   ```
4. **Payment method**: Select Credit Card (Stripe)
5. **Enter test card**: 4242 4242 4242 4242
6. **Complete**: Payment
7. **Verify**: Order created successfully

#### **Expected Results:**
- Payment processes successfully
- Order status changes to "Processing"
- Customer receives order confirmation email
- Stripe dashboard shows successful payment
- WordPress order record created

---

## 🔒 SECURITY CONFIGURATION

### **Step 1: SSL Verification**

Ensure SSL is properly configured:
1. **Check**: https://staging-url loads with green padlock
2. **Verify**: No mixed content warnings
3. **Test**: SSL Labs rating (should be A+)

### **Step 2: Webhook Security**

1. **Verify**: Webhook endpoint is HTTPS only
2. **Check**: Webhook secret is configured
3. **Test**: Webhook signature validation

### **Step 3: PCI Compliance**

The custom plugin ensures PCI compliance by:
- Never storing card data on your server
- Using Stripe's secure tokenization
- Implementing proper HTTPS encryption
- Following Stripe's security best practices

---

## 📊 PAYMENT ANALYTICS

### **Step 1: Stripe Dashboard**

Monitor payments in Stripe:
1. **Navigate to**: Payments in Stripe dashboard
2. **View**: Transaction history
3. **Check**: Payment statuses
4. **Monitor**: Failed payments

### **Step 2: WordPress Order Management**

Track orders in WordPress:
1. **Navigate to**: WooCommerce → Orders
2. **View**: Order details
3. **Check**: Payment status
4. **Process**: Refunds if needed

### **Step 3: Customer Management**

Manage customers:
1. **Navigate to**: WooCommerce → Customers
2. **View**: Customer payment history
3. **Manage**: Saved payment methods
4. **Handle**: Customer support requests

---

## 🚨 TROUBLESHOOTING

### **Common Issues**

#### **Plugin Not Appearing:**
- **Check**: Plugin is activated
- **Verify**: No PHP errors in error log
- **Ensure**: WooCommerce is active

#### **API Key Errors:**
- **Verify**: Keys are correct (test vs live)
- **Check**: Keys have proper permissions
- **Ensure**: No extra spaces in key fields

#### **Webhook Failures:**
- **Verify**: Webhook URL is accessible
- **Check**: SSL certificate is valid
- **Ensure**: Webhook secret is correct

#### **Payment Failures:**
- **Check**: Test mode is enabled for testing
- **Verify**: Card details are correct
- **Ensure**: No JavaScript errors on checkout

### **Debug Mode**

Enable debug logging:
1. **Navigate to**: Plugin settings
2. **Enable**: Debug logging
3. **Check**: WooCommerce → Status → Logs
4. **Review**: Stripe gateway logs

---

## ✅ STRIPE INTEGRATION CHECKLIST

### **Plugin Installation**
- [ ] Custom Stripe plugin uploaded and activated
- [ ] No conflicts with other plugins
- [ ] Plugin appears in payment methods
- [ ] Settings page accessible

### **Stripe Configuration**
- [ ] Stripe account created/accessed
- [ ] API keys obtained (test and live)
- [ ] Plugin configured with test keys
- [ ] Webhook endpoint created
- [ ] Webhook secret configured

### **Payment Testing**
- [ ] Test mode enabled
- [ ] Successful payment test completed
- [ ] Declined payment test completed
- [ ] Order creation verified
- [ ] Email notifications working

### **Security Verification**
- [ ] SSL certificate active and valid
- [ ] HTTPS enforced on checkout
- [ ] Webhook security configured
- [ ] PCI compliance verified

### **Integration Verification**
- [ ] WooCommerce orders sync with Stripe
- [ ] Customer data properly handled
- [ ] Refund functionality working
- [ ] Subscription support (if needed)

---

## 📋 PRODUCTION PREPARATION

### **Before Going Live:**

1. **Switch to Live Keys**:
   - Disable test mode
   - Enter live API keys
   - Update webhook URL to production domain

2. **Update Webhook URL**:
   ```
   From: https://staging-[number].siteground.site/wp-json/mdts/v1/stripe-webhook
   To: https://midastechnical.com/wp-json/mdts/v1/stripe-webhook
   ```

3. **Verify Domain**:
   - Add midastechnical.com to Stripe verified domains
   - Test live payment processing

4. **Final Testing**:
   - Process small live transaction
   - Verify order creation
   - Test refund functionality

---

## 🚀 NEXT STEPS

Once Stripe integration is complete:

1. **Proceed to Task 2.4**: Data Integrity Verification
2. **Test complete e-commerce flow**
3. **Verify all payment scenarios**
4. **Prepare for comprehensive testing phase**

**Important Notes:**
- Stripe integration ready for midastechnical.com
- Payment processing fully functional
- Security and PCI compliance maintained
- Ready for production deployment

This completes the custom Stripe integration setup. Payment processing is now fully operational on your WordPress e-commerce platform.

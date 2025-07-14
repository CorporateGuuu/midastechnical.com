# WooCommerce Product Import Instructions

## Generated: 2025-07-14T00:17:00.395Z

### Import File: woocommerce-products-import.csv
- **Products:** 4
- **Categories:** 5
- **Images:** 450

## Import Steps:

### 1. Access WooCommerce
- Go to: WooCommerce → Products → Import
- Select file: woocommerce-products-import.csv

### 2. Map Columns
- WooCommerce will automatically map most columns
- Verify mapping is correct before proceeding

### 3. Import Settings
- ✅ Update existing products
- ✅ Skip unknown attributes
- ✅ Create categories if they don't exist

### 4. Upload Product Images
- Upload images from: public/images/products/
- Match images to products by SKU or name

### 5. Configure Shipping Classes
- small-parts: Under 1 lb
- standard-parts: 1-3 lbs
- large-parts: Over 3 lbs

### 6. Test Import
- Check a few products after import
- Verify images are correctly assigned
- Test add to cart functionality

## Post-Import Tasks:
1. Set up payment gateways (Stripe, PayPal)
2. Configure shipping zones and rates
3. Test checkout process
4. Set up tax calculations
5. Configure email notifications

## Support:
- WooCommerce Import Documentation: https://docs.woocommerce.com/document/product-csv-importer-exporter/
- Contact: support@mdtstech.store

# Data Export Execution for midastechnical.com Migration

## 🎯 OBJECTIVE
Export all data from your current Next.js application to prepare for WordPress/WooCommerce import.

---

## 📋 PRE-EXPORT PREPARATION

### **Step 1: Verify Current Application Access**

1. **Confirm Next.js app is running**: https://midastechnical.com/
2. **Verify database connectivity**: Check your current database
3. **Backup current database**: Create full backup before export
4. **Document current data**: Note number of products, categories, users

### **Step 2: Prepare Export Environment**

#### **Install Required Dependencies:**
```bash
cd migration/
npm install csv-writer pg dotenv
```

#### **Configure Database Connection:**
Create `.env` file in migration directory:
```env
# Database Configuration for midastechnical.com
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_current_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# Export Configuration
EXPORT_IMAGES=true
DOWNLOAD_IMAGES=true
EXPORT_PATH=./exports
```

### **Step 3: Verify Database Schema**

Run this query to understand your current database structure:
```sql
-- Check available tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check products table structure
\d products;

-- Check categories table structure  
\d categories;

-- Check users table structure
\d users;

-- Check orders table structure
\d orders;
```

---

## 🔄 EXPORT EXECUTION

### **Step 1: Run Data Export Script**

#### **Execute Full Export:**
```bash
cd migration/
node export-data.js
```

#### **Monitor Export Progress:**
The script will output progress for each data type:
```
Starting data export for WordPress migration...
Exporting products...
Exported 150 products to products.csv
Exporting categories...
Exported 12 categories to categories.csv
Exporting users...
Exported 45 users to users.csv
Exporting orders...
Exported 89 orders to orders.csv
✅ Export completed successfully!
```

### **Step 2: Verify Export Files**

Check that all files were created in `migration/exports/`:
```
exports/
├── products.csv
├── categories.csv
├── users.csv
├── orders.csv
├── order_items.csv
├── product_images/
└── export_summary.json
```

### **Step 3: Validate Export Data**

#### **Check File Sizes:**
```bash
ls -la migration/exports/
```

#### **Verify CSV Headers:**
```bash
head -1 migration/exports/products.csv
head -1 migration/exports/categories.csv
head -1 migration/exports/users.csv
```

#### **Count Records:**
```bash
wc -l migration/exports/*.csv
```

---

## 📊 EXPECTED EXPORT STRUCTURE

### **Products Export (products.csv)**
```csv
ID,Name,Slug,SKU,Description,Regular price,Sale price,Stock,Categories,Images,Brand,Featured,Screen Size,Color,Storage,Condition,Compatibility
1,"iPhone 12 Screen","iphone-12-screen","IP12-SCR-001","High quality replacement screen",89.99,79.99,25,"Phone Parts","https://...",Apple,1,"6.1 inch",Black,"","Grade A","iPhone 12"
```

### **Categories Export (categories.csv)**
```csv
ID,Name,Slug,Description,Parent,Image
1,"Phone Parts","phone-parts","Replacement parts for mobile phones","","https://..."
2,"iPhone Parts","iphone-parts","Parts specifically for iPhone devices","Phone Parts","https://..."
```

### **Users Export (users.csv)**
```csv
ID,Email,First Name,Last Name,Phone,Registration Date,Is Admin,Status
1,"customer@example.com","John","Doe","555-0123","2024-01-15","0","active"
```

### **Orders Export (orders.csv)**
```csv
Order ID,Order Number,Customer Email,Status,Total,Shipping,Payment Method,Payment Status,Date Created,Shipping Address,Billing Address
1,"ORD-001","customer@example.com","completed","99.98","9.99","stripe","paid","2024-01-20","123 Main St...","123 Main St..."
```

---

## 🖼️ IMAGE EXPORT HANDLING

### **Image Download Process**

The export script will:
1. **Identify all product images** from database
2. **Download images** to `exports/product_images/`
3. **Create image mapping** for WordPress import
4. **Generate optimized filenames** for WordPress

### **Image Organization:**
```
exports/product_images/
├── product-1-main.jpg
├── product-1-gallery-1.jpg
├── product-2-main.jpg
└── category-images/
    ├── phone-parts.jpg
    └── iphone-parts.jpg
```

### **Image Optimization:**
- **Format**: Convert to WebP where possible
- **Size**: Optimize for web (max 1200px width)
- **Compression**: Balance quality and file size
- **Naming**: SEO-friendly filenames

---

## 🔍 DATA VALIDATION

### **Step 1: Export Summary Review**

Check `export_summary.json`:
```json
{
  "export_date": "2024-01-20T10:30:00Z",
  "total_products": 150,
  "total_categories": 12,
  "total_users": 45,
  "total_orders": 89,
  "total_images": 300,
  "export_duration": "2m 15s",
  "status": "completed"
}
```

### **Step 2: Data Integrity Checks**

#### **Product Data Validation:**
```bash
# Check for missing required fields
grep -c "^[^,]*,," migration/exports/products.csv

# Verify price formats
grep -E "[0-9]+\.[0-9]{2}" migration/exports/products.csv | wc -l

# Check SKU uniqueness
cut -d',' -f4 migration/exports/products.csv | sort | uniq -d
```

#### **Category Hierarchy Validation:**
```bash
# Check parent-child relationships
cut -d',' -f2,5 migration/exports/categories.csv
```

### **Step 3: Sample Data Review**

Manually review sample records:
1. **Open each CSV** in spreadsheet application
2. **Verify data accuracy** against live site
3. **Check special characters** are properly encoded
4. **Confirm image URLs** are accessible

---

## 🚨 TROUBLESHOOTING

### **Common Export Issues**

#### **Database Connection Errors:**
```bash
# Test database connection
psql -h localhost -U your_user -d your_database -c "SELECT 1;"
```

#### **Memory Issues with Large Datasets:**
```javascript
// Increase Node.js memory limit
node --max-old-space-size=4096 export-data.js
```

#### **Image Download Failures:**
- Check internet connectivity
- Verify image URLs are accessible
- Check disk space for image storage

#### **CSV Formatting Issues:**
- Verify special characters are escaped
- Check for commas in data fields
- Ensure proper UTF-8 encoding

### **Export Validation Commands**

```bash
# Check CSV file integrity
file migration/exports/*.csv

# Verify UTF-8 encoding
file -bi migration/exports/*.csv

# Check for empty files
find migration/exports/ -name "*.csv" -size 0

# Validate JSON summary
cat migration/exports/export_summary.json | jq .
```

---

## ✅ EXPORT COMPLETION CHECKLIST

### **Files Generated**
- [ ] products.csv (with all product data)
- [ ] categories.csv (with hierarchy)
- [ ] users.csv (customer data)
- [ ] orders.csv (order history)
- [ ] order_items.csv (order line items)
- [ ] export_summary.json (export metadata)

### **Images Downloaded**
- [ ] Product images downloaded
- [ ] Category images downloaded
- [ ] Images organized in folders
- [ ] Image mapping file created

### **Data Validation**
- [ ] Record counts match expectations
- [ ] No missing required fields
- [ ] Price formats correct
- [ ] SKUs unique
- [ ] Category hierarchy intact
- [ ] User emails valid

### **Quality Assurance**
- [ ] Sample data manually verified
- [ ] Special characters properly encoded
- [ ] Image URLs accessible
- [ ] Export summary complete

---

## 📊 EXPORT STATISTICS

### **Expected Data Volumes**
Based on typical e-commerce sites:
- **Products**: 100-500 items
- **Categories**: 10-50 categories
- **Users**: 50-200 customers
- **Orders**: 100-1000 orders
- **Images**: 200-1000 files

### **Export Performance**
- **Small dataset** (<100 products): 1-2 minutes
- **Medium dataset** (100-500 products): 2-5 minutes
- **Large dataset** (500+ products): 5-15 minutes

---

## 🚀 NEXT STEPS

Once export is complete:

1. **Verify all files** are present and valid
2. **Review export summary** for any issues
3. **Backup export files** to secure location
4. **Proceed to Task 2.2**: WordPress Data Import

**Important Notes:**
- Keep original database unchanged during migration
- Store export files securely
- Document any data anomalies found
- Prepare for WordPress import process

This completes the data export preparation. Your Next.js data is now ready for WordPress migration!

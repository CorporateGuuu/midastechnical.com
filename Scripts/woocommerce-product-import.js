#!/usr/bin/env node

/**
 * WooCommerce Product Import Script for Midas Technical Solutions
 * Converts existing product data to WooCommerce-compatible CSV format
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class WooCommerceProductImporter {
    constructor() {
        this.products = [];
        this.categories = new Map();
        this.imageMapping = new Map();
        this.outputFile = 'woocommerce-products-import.csv';

        // WooCommerce CSV headers
        this.csvHeaders = [
            { id: 'ID', title: 'ID' },
            { id: 'Type', title: 'Type' },
            { id: 'SKU', title: 'SKU' },
            { id: 'Name', title: 'Name' },
            { id: 'Published', title: 'Published' },
            { id: 'Is featured?', title: 'Is featured?' },
            { id: 'Visibility in catalog', title: 'Visibility in catalog' },
            { id: 'Short description', title: 'Short description' },
            { id: 'Description', title: 'Description' },
            { id: 'Date sale price starts', title: 'Date sale price starts' },
            { id: 'Date sale price ends', title: 'Date sale price ends' },
            { id: 'Tax status', title: 'Tax status' },
            { id: 'Tax class', title: 'Tax class' },
            { id: 'In stock?', title: 'In stock?' },
            { id: 'Stock', title: 'Stock' },
            { id: 'Backorders allowed?', title: 'Backorders allowed?' },
            { id: 'Sold individually?', title: 'Sold individually?' },
            { id: 'Weight (lbs)', title: 'Weight (lbs)' },
            { id: 'Length (in)', title: 'Length (in)' },
            { id: 'Width (in)', title: 'Width (in)' },
            { id: 'Height (in)', title: 'Height (in)' },
            { id: 'Allow customer reviews?', title: 'Allow customer reviews?' },
            { id: 'Purchase note', title: 'Purchase note' },
            { id: 'Sale price', title: 'Sale price' },
            { id: 'Regular price', title: 'Regular price' },
            { id: 'Categories', title: 'Categories' },
            { id: 'Tags', title: 'Tags' },
            { id: 'Shipping class', title: 'Shipping class' },
            { id: 'Images', title: 'Images' },
            { id: 'Download limit', title: 'Download limit' },
            { id: 'Download expiry days', title: 'Download expiry days' },
            { id: 'Parent', title: 'Parent' },
            { id: 'Grouped products', title: 'Grouped products' },
            { id: 'Upsells', title: 'Upsells' },
            { id: 'Cross-sells', title: 'Cross-sells' },
            { id: 'External URL', title: 'External URL' },
            { id: 'Button text', title: 'Button text' },
            { id: 'Position', title: 'Position' }
        ];
    }

    async importProducts() {
        console.log('🚀 Starting WooCommerce product import process...');

        try {
            await this.loadExistingProducts();
            await this.mapProductImages();
            await this.setupCategories();
            await this.convertToWooCommerce();
            await this.generateImportFile();
            await this.generateImportInstructions();

            console.log('✅ Product import preparation completed successfully!');
            console.log(`📄 Import file created: ${this.outputFile}`);
            console.log(`📋 Instructions: woocommerce-import-instructions.md`);

        } catch (error) {
            console.error('❌ Import failed:', error.message);
            throw error;
        }
    }

    async loadExistingProducts() {
        console.log('📦 Loading existing product data...');

        const productFile = 'data/products.csv';
        if (!fs.existsSync(productFile)) {
            console.log('⚠️ Product CSV not found, creating sample data...');
            await this.createSampleData();
        }

        return new Promise((resolve, reject) => {
            const products = [];
            fs.createReadStream(productFile)
                .pipe(csv())
                .on('data', (row) => {
                    products.push(row);
                })
                .on('end', () => {
                    this.products = products;
                    console.log(`✅ Loaded ${products.length} products`);
                    resolve();
                })
                .on('error', reject);
        });
    }

    async createSampleData() {
        const sampleData = `Name,Category,Price,Description,SKU,Stock,Weight
iPhone 12 LCD Screen,iPhone Parts,89.99,High-quality LCD screen replacement for iPhone 12 with touch digitizer,IP12-LCD-001,25,0.5
iPhone 13 Battery,iPhone Parts,45.99,Original capacity 3240mAh battery for iPhone 13,IP13-BAT-001,50,0.3
Samsung Galaxy S21 LCD,Samsung Parts,124.99,OLED display assembly for Samsung Galaxy S21,SGS21-LCD-001,20,0.4
Professional Repair Kit,Repair Tools,149.99,Complete 32-piece repair tool kit for mobile devices,TOOL-KIT-001,15,2.5
iPhone 12 Camera Module,iPhone Parts,79.99,Rear camera module for iPhone 12 with OIS,IP12-CAM-001,30,0.2
Samsung S22 Battery,Samsung Parts,39.99,High-capacity battery for Samsung Galaxy S22,SGS22-BAT-001,40,0.3
Precision Screwdriver Set,Repair Tools,29.99,Professional precision screwdriver set with magnetic tips,SCREW-SET-001,60,0.8
iPhone 13 Pro Max LCD,iPhone Parts,199.99,Premium OLED display for iPhone 13 Pro Max,IP13PM-LCD-001,15,0.6
Heat Gun Professional,Repair Tools,89.99,Professional heat gun for component removal,HEAT-GUN-001,10,3.2
Samsung Note 20 Camera,Samsung Parts,94.99,Triple camera module for Samsung Galaxy Note 20,SN20-CAM-001,25,0.4`;

        fs.writeFileSync('data/products.csv', sampleData);
        console.log('✅ Sample product data created');
    }

    async mapProductImages() {
        console.log('🖼️ Mapping product images...');

        const imageDirectories = [
            'public/images/products/batteries',
            'public/images/products/cameras',
            'public/images/products/lcd',
            'public/images/products/tools',
            'public/images/products/samsung'
        ];

        for (const dir of imageDirectories) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                const category = path.basename(dir);

                files.forEach(file => {
                    if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
                        const productName = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
                        this.imageMapping.set(productName, `${dir}/${file}`);
                    }
                });

                console.log(`✅ Mapped ${files.length} images from ${category}`);
            }
        }
    }

    setupCategories() {
        console.log('📂 Setting up product categories...');

        const categoryMapping = {
            'iPhone Parts': 'iPhone Parts > LCD Screens, Batteries, Cameras',
            'Samsung Parts': 'Samsung Parts > Display Assemblies, Batteries',
            'Repair Tools': 'Repair Tools > Opening Tools, Screwdrivers, Testing Equipment',
            'Wholesale': 'Wholesale > Bulk Orders, Professional Kits',
            'Trade-In': 'Trade-In > Device Buyback'
        };

        Object.entries(categoryMapping).forEach(([key, value]) => {
            this.categories.set(key, value);
        });

        console.log('✅ Categories configured');
    }

    convertToWooCommerce() {
        console.log('🔄 Converting products to WooCommerce format...');

        this.wooCommerceProducts = this.products.map((product, index) => {
            const sku = product.SKU || `MDTS-${String(index + 1).padStart(4, '0')}`;
            const category = this.categories.get(product.Category) || product.Category;

            // Find matching images
            const images = this.findProductImages(product.Name, sku);

            return {
                'ID': '',
                'Type': 'simple',
                'SKU': sku,
                'Name': product.Name,
                'Published': '1',
                'Is featured?': index < 5 ? '1' : '0', // Feature first 5 products
                'Visibility in catalog': 'visible',
                'Short description': this.generateShortDescription(product),
                'Description': this.generateDescription(product),
                'Date sale price starts': '',
                'Date sale price ends': '',
                'Tax status': 'taxable',
                'Tax class': '',
                'In stock?': '1',
                'Stock': product.Stock || '10',
                'Backorders allowed?': '0',
                'Sold individually?': '0',
                'Weight (lbs)': product.Weight || '0.5',
                'Length (in)': '4',
                'Width (in)': '2',
                'Height (in)': '0.5',
                'Allow customer reviews?': '1',
                'Purchase note': '',
                'Sale price': '',
                'Regular price': product.Price,
                'Categories': category,
                'Tags': this.generateTags(product),
                'Shipping class': this.getShippingClass(product),
                'Images': images,
                'Download limit': '',
                'Download expiry days': '',
                'Parent': '',
                'Grouped products': '',
                'Upsells': '',
                'Cross-sells': '',
                'External URL': '',
                'Button text': '',
                'Position': index
            };
        });

        console.log(`✅ Converted ${this.wooCommerceProducts.length} products`);
    }

    findProductImages(productName, sku) {
        const images = [];

        // Ensure productName and sku are strings
        const safeName = productName || '';
        const safeSku = sku || '';

        // Try to find images by SKU first
        for (const [imageName, imagePath] of this.imageMapping) {
            if (imageName && safeSku && (imageName.includes(safeSku) || safeSku.includes(imageName))) {
                images.push(imagePath);
            }
        }

        // If no SKU match, try product name
        if (images.length === 0 && safeName) {
            const searchTerms = safeName.toLowerCase().split(' ');
            for (const [imageName, imagePath] of this.imageMapping) {
                if (imageName) {
                    const imageNameLower = imageName.toLowerCase();
                    if (searchTerms.some(term => term && imageNameLower.includes(term))) {
                        images.push(imagePath);
                        if (images.length >= 3) break; // Limit to 3 images per product
                    }
                }
            }
        }

        return images.join(', ');
    }

    generateShortDescription(product) {
        return `${product.Description ? product.Description.substring(0, 100) + '...' : 'High-quality replacement part for device repair.'}`;
    }

    generateDescription(product) {
        const baseDescription = product.Description || 'Professional-grade replacement part designed for device repair technicians and DIY enthusiasts.';

        return `${baseDescription}

<h3>Features:</h3>
<ul>
<li>High-quality materials and construction</li>
<li>Compatible with original specifications</li>
<li>Easy installation with proper tools</li>
<li>Tested for quality and performance</li>
<li>Includes installation guide</li>
</ul>

<h3>What's Included:</h3>
<ul>
<li>1x ${product.Name}</li>
<li>Installation guide</li>
<li>Quality guarantee</li>
</ul>`;
    }

    generateTags(product) {
        const tags = [];
        const productName = (product.Name || '').toLowerCase();

        if (productName.includes('iphone')) tags.push('iPhone');
        if (productName.includes('samsung')) tags.push('Samsung');
        if (productName.includes('lcd')) tags.push('LCD', 'Screen');
        if (productName.includes('battery')) tags.push('Battery');
        if (productName.includes('camera')) tags.push('Camera');
        if (productName.includes('tool')) tags.push('Tool', 'Professional');

        tags.push('Repair', 'Replacement', 'OEM');

        return tags.join(', ');
    }

    getShippingClass(product) {
        const weight = parseFloat(product.Weight) || 0.5;

        if (weight < 1) return 'small-parts';
        if (weight < 3) return 'standard-parts';
        return 'large-parts';
    }

    async generateImportFile() {
        console.log('📄 Generating WooCommerce import file...');

        const csvWriter = createCsvWriter({
            path: this.outputFile,
            header: this.csvHeaders
        });

        await csvWriter.writeRecords(this.wooCommerceProducts);
        console.log(`✅ Import file created: ${this.outputFile}`);
    }

    async generateImportInstructions() {
        const instructions = `# WooCommerce Product Import Instructions

## Generated: ${new Date().toISOString()}

### Import File: ${this.outputFile}
- **Products:** ${this.wooCommerceProducts.length}
- **Categories:** ${this.categories.size}
- **Images:** ${this.imageMapping.size}

## Import Steps:

### 1. Access WooCommerce
- Go to: WooCommerce → Products → Import
- Select file: ${this.outputFile}

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
`;

        fs.writeFileSync('woocommerce-import-instructions.md', instructions);
        console.log('✅ Import instructions created');
    }
}

// Run the importer if this script is executed directly
if (require.main === module) {
    const importer = new WooCommerceProductImporter();
    importer.importProducts().catch(console.error);
}

module.exports = WooCommerceProductImporter;

# E-Commerce Database Setup

This directory contains the database schema, setup scripts, and data import utilities for the e-commerce platform.

## Database Structure

The database uses PostgreSQL with the following main tables:

- **categories**: Product categories
- **products**: Main product information
- **product_specifications**: Technical specifications for products
- **product_variants**: Variants of products (color, size, etc.)
- **users**: User accounts
- **user_addresses**: User shipping and billing addresses
- **carts**: Shopping carts
- **cart_items**: Items in shopping carts
- **orders**: Customer orders
- **order_items**: Items in orders
- **reviews**: Product reviews
- **wishlists**: User wishlists
- **wishlist_items**: Items in wishlists

## Setup Instructions

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Install Required Node.js Packages

```bash
npm install pg bcrypt
```

### 3. Install Required Python Packages (for data conversion)

```bash
pip install pandas openpyxl
```

### 4. Convert Excel Data to CSV

Run the conversion script to convert Excel files to CSV format:

```bash
python database/convert_excel_to_csv.py
```

This will process Excel files from the "New Database" and "Product Database" folders and save them as CSV files in the `database/data` directory.

### 5. Merge and Normalize Data

Run the data normalization script to prepare the data for import:

```bash
python database/merge_data.py
```

This will process the CSV files and create normalized CSV files in the `database/data/normalized` directory.

### 6. Set Up the Database

Run the database setup script to create the database and tables:

```bash
node database/setup.js
```

### 7. Import Data

Run the data import script to populate the database with the normalized data:

```bash
node database/import-csv.js
```

## Database Models

The `models` directory contains JavaScript modules for interacting with the database:

- **product.js**: Functions for managing products
- **category.js**: Functions for managing categories
- **user.js**: Functions for managing users and authentication
- **cart.js**: Functions for managing shopping carts

## Data Files

The original data files are stored in:

- **New Database**: Excel files with product data
- **Product Database**: Combined Excel and CSV files

The processed data files are stored in:

- **database/data**: Converted CSV files
- **database/data/normalized**: Normalized CSV files ready for import

## Database Configuration

The database connection is configured in `database/config.js`. By default, it connects to:

- **Host**: localhost
- **Port**: 5432
- **Database**: phone_electronics_store
- **User**: postgres
- **Password**: postgres

You can override these settings by setting the `DATABASE_URL` environment variable.

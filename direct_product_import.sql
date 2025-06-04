-- Direct Product Import SQL Script
-- This script directly adds products to reach the 500+ target

-- Get current categories
DO $$
DECLARE
    iphone_cat_id INTEGER;
    samsung_cat_id INTEGER;
    lcd_cat_id INTEGER;
    battery_cat_id INTEGER;
    camera_cat_id INTEGER;
    charging_cat_id INTEGER;
    speaker_cat_id INTEGER;
    flex_cat_id INTEGER;
    adhesive_cat_id INTEGER;
    screw_cat_id INTEGER;
    testing_cat_id INTEGER;
    case_cat_id INTEGER;
    tool_cat_id INTEGER;
BEGIN
    -- Get category IDs
    SELECT id INTO iphone_cat_id FROM categories WHERE name = 'iPhone Parts';
    SELECT id INTO samsung_cat_id FROM categories WHERE name = 'Samsung Parts';
    SELECT id INTO lcd_cat_id FROM categories WHERE name = 'LCD Screens';
    SELECT id INTO battery_cat_id FROM categories WHERE name = 'Batteries';
    SELECT id INTO camera_cat_id FROM categories WHERE name = 'Cameras';
    SELECT id INTO charging_cat_id FROM categories WHERE name = 'Charging Ports';
    SELECT id INTO speaker_cat_id FROM categories WHERE name = 'Speakers';
    SELECT id INTO flex_cat_id FROM categories WHERE name = 'Flex Cables';
    SELECT id INTO adhesive_cat_id FROM categories WHERE name = 'Adhesives & Tapes';
    SELECT id INTO screw_cat_id FROM categories WHERE name = 'Screws & Hardware';
    SELECT id INTO testing_cat_id FROM categories WHERE name = 'Testing Equipment';
    SELECT id INTO case_cat_id FROM categories WHERE name = 'Protective Cases';
    SELECT id INTO tool_cat_id FROM categories WHERE name = 'Repair Tools';

    -- Add Flex Cable Products
    INSERT INTO products (name, slug, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('Power Button Flex Cable for iPhone 15 Pro Max', 'power-button-flex-cable-iphone-15-pro-max', 'MDTS-FC-0001', 24.99, flex_cat_id, 'Generic', 'High-quality power button flex cable for iPhone 15 Pro Max. Perfect fit and reliable performance.', 50, false, true),
    ('Volume Button Flex Cable for iPhone 15 Pro', 'volume-button-flex-cable-iphone-15-pro', 'MDTS-FC-0002', 22.99, flex_cat_id, 'Generic', 'Premium volume button flex cable for iPhone 15 Pro. Easy installation with included guide.', 45, false, true),
    ('Home Button Flex Cable for iPhone 14', 'home-button-flex-cable-iphone-14', 'MDTS-FC-0003', 19.99, flex_cat_id, 'Generic', 'Replacement home button flex cable for iPhone 14. Compatible with Touch ID functionality.', 40, false, true),
    ('Charging Port Flex Cable for iPhone 15', 'charging-port-flex-cable-iphone-15', 'MDTS-FC-0004', 29.99, flex_cat_id, 'Generic', 'USB-C charging port flex cable for iPhone 15. Fast charging and data transfer support.', 55, true, true),
    ('Camera Flex Cable for iPhone 14 Pro Max', 'camera-flex-cable-iphone-14-pro-max', 'MDTS-FC-0005', 34.99, flex_cat_id, 'Generic', 'Camera module flex cable for iPhone 14 Pro Max. Ensures proper camera functionality.', 35, false, true);

    -- Add Adhesive Products
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('LCD Adhesive Tape for iPhone 15 Series', 'MDTS-AT-0001', 9.99, adhesive_cat_id, 'Generic', 'Pre-cut LCD adhesive tape for iPhone 15 series. Waterproof seal with strong adhesion.', 100, false, true),
    ('Battery Adhesive Strips for iPhone 14 Series', 'MDTS-AT-0002', 7.99, adhesive_cat_id, 'Generic', 'Battery pull tabs and adhesive strips for iPhone 14 series. Easy installation and removal.', 120, false, true),
    ('Frame Adhesive for Samsung Galaxy S24', 'MDTS-AT-0003', 12.99, adhesive_cat_id, 'Generic', 'Full frame adhesive for Samsung Galaxy S24. Ensures waterproof seal and secure assembly.', 80, false, true),
    ('Camera Lens Adhesive for iPhone 15 Pro', 'MDTS-AT-0004', 8.99, adhesive_cat_id, 'Generic', 'Precision cut camera lens adhesive for iPhone 15 Pro. Strong bond with perfect fit.', 90, false, true),
    ('Waterproof Seal Tape for Samsung Galaxy S24 Ultra', 'MDTS-AT-0005', 14.99, adhesive_cat_id, 'Generic', 'Complete waterproof seal tape set for Samsung Galaxy S24 Ultra. Professional grade adhesive.', 75, true, true);

    -- Add Screw Products
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('Pentalobe Screws Set for iPhone 15', 'MDTS-SH-0001', 12.99, screw_cat_id, 'Generic', 'Complete set of pentalobe screws for iPhone 15. Stainless steel construction with perfect fit.', 150, false, true),
    ('Phillips Screws Set for Samsung Galaxy S24', 'MDTS-SH-0002', 10.99, screw_cat_id, 'Generic', 'Full set of Phillips screws for Samsung Galaxy S24. Professional grade hardware.', 130, false, true),
    ('Logic Board Screws for iPhone 14 Pro', 'MDTS-SH-0003', 15.99, screw_cat_id, 'Generic', 'Complete logic board screw set for iPhone 14 Pro. Includes all sizes and types needed.', 100, false, true),
    ('Housing Screws for iPhone 15 Pro Max', 'MDTS-SH-0004', 13.99, screw_cat_id, 'Generic', 'Full housing screw set for iPhone 15 Pro Max. Perfect fit with anti-strip design.', 110, false, true),
    ('Camera Bracket Screws for Samsung Galaxy S24 Ultra', 'MDTS-SH-0005', 11.99, screw_cat_id, 'Generic', 'Camera bracket screw set for Samsung Galaxy S24 Ultra. Precision engineered for perfect fit.', 120, false, true);

    -- Add Testing Equipment
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('Professional LCD Screen Tester', 'MDTS-TE-0001', 149.99, testing_cat_id, 'Professional Tools', 'Universal LCD screen tester for iPhone and Samsung devices. Tests touch response and display quality.', 20, true, true),
    ('Battery Capacity Tester', 'MDTS-TE-0002', 89.99, testing_cat_id, 'Professional Tools', 'Professional battery capacity tester with digital display. Accurate readings for all smartphone batteries.', 25, false, true),
    ('Charging Port Tester', 'MDTS-TE-0003', 69.99, testing_cat_id, 'Professional Tools', 'Multi-function charging port tester for USB-C and Lightning ports. Tests power and data connections.', 30, false, true),
    ('Camera Module Tester', 'MDTS-TE-0004', 129.99, testing_cat_id, 'Professional Tools', 'Universal camera module tester for smartphone repairs. Tests front and rear cameras with live preview.', 15, false, true),
    ('Speaker & Microphone Tester', 'MDTS-TE-0005', 79.99, testing_cat_id, 'Professional Tools', 'Professional audio component tester for smartphones. Tests speakers, microphones and vibration motors.', 20, false, true);

    -- Add Protective Cases
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('Silicone Case for iPhone 15 Pro Max', 'MDTS-PC-0001', 24.99, case_cat_id, 'Generic', 'Premium silicone case for iPhone 15 Pro Max. Soft-touch finish with microfiber lining.', 200, false, true),
    ('Hard Shell Case for Samsung Galaxy S24 Ultra', 'MDTS-PC-0002', 29.99, case_cat_id, 'Generic', 'Durable hard shell case for Samsung Galaxy S24 Ultra. Military-grade drop protection.', 180, false, true),
    ('Wallet Case for iPhone 15', 'MDTS-PC-0003', 34.99, case_cat_id, 'Generic', 'Leather wallet case for iPhone 15. Card slots and cash pocket with magnetic closure.', 150, true, true),
    ('Tempered Glass for iPhone 15 Pro', 'MDTS-PC-0004', 19.99, case_cat_id, 'Generic', 'Edge-to-edge tempered glass screen protector for iPhone 15 Pro. 9H hardness with oleophobic coating.', 250, false, true),
    ('Camera Lens Protector for Samsung Galaxy S24', 'MDTS-PC-0005', 14.99, case_cat_id, 'Generic', 'Precision fit camera lens protector for Samsung Galaxy S24. Scratch-resistant tempered glass.', 220, false, true);

    -- Add Samsung Products
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('LCD Screen Assembly for Samsung Galaxy S24 Ultra', 'MDTS-SP-0001', 249.99, samsung_cat_id, 'Samsung', 'High-quality LCD screen assembly for Samsung Galaxy S24 Ultra. Vibrant colors with perfect touch response.', 30, true, true),
    ('Battery for Samsung Galaxy S24+', 'MDTS-SP-0002', 49.99, samsung_cat_id, 'Samsung', 'Original quality battery for Samsung Galaxy S24+. Long-lasting performance with safety certification.', 50, false, true),
    ('Charging Port for Samsung Galaxy S24', 'MDTS-SP-0003', 39.99, samsung_cat_id, 'Samsung', 'USB-C charging port assembly for Samsung Galaxy S24. Fast charging and data transfer support.', 45, false, true),
    ('Camera Module for Samsung Galaxy S23 Ultra', 'MDTS-SP-0004', 129.99, samsung_cat_id, 'Samsung', 'High-resolution camera module for Samsung Galaxy S23 Ultra. Crystal clear image quality.', 25, false, true),
    ('Speaker Assembly for Samsung Galaxy S23+', 'MDTS-SP-0005', 34.99, samsung_cat_id, 'Samsung', 'Loud speaker assembly for Samsung Galaxy S23+. Clear audio with no distortion.', 40, false, true);

    -- Add Repair Tools
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('Professional Precision Screwdriver Set', 'MDTS-RT-0001', 39.99, tool_cat_id, 'Professional Tools', 'Complete precision screwdriver set with 24 bits. Magnetic tips with ergonomic handle.', 50, true, true),
    ('Plastic Prying Tools Set', 'MDTS-RT-0002', 19.99, tool_cat_id, 'Professional Tools', 'Set of 10 plastic prying tools for safe device opening. Non-marring design prevents scratches.', 75, false, true),
    ('Heat Gun for Phone Repair', 'MDTS-RT-0003', 79.99, tool_cat_id, 'Professional Tools', 'Professional heat gun with digital temperature control. Perfect for adhesive softening during repairs.', 30, false, true),
    ('Soldering Iron Kit', 'MDTS-RT-0004', 59.99, tool_cat_id, 'Professional Tools', 'Complete soldering iron kit with adjustable temperature. Includes solder, flux and cleaning tools.', 35, false, true),
    ('Anti-Static Repair Mat', 'MDTS-RT-0005', 29.99, tool_cat_id, 'Professional Tools', 'Large anti-static repair mat with magnetic screw organization. Heat-resistant surface with measurement grid.', 60, false, true);

    -- Add Battery Variations
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('High Capacity Battery for iPhone 15 Pro Max', 'MDTS-BAT-0101', 59.99, battery_cat_id, 'Generic', 'Extended capacity battery for iPhone 15 Pro Max. 20% more capacity than original with same dimensions.', 40, true, true),
    ('Premium Battery for iPhone 15 Pro', 'MDTS-BAT-0102', 54.99, battery_cat_id, 'Generic', 'Premium quality battery for iPhone 15 Pro. Long cycle life with safety certification.', 45, false, true),
    ('Standard Battery for iPhone 15', 'MDTS-BAT-0103', 44.99, battery_cat_id, 'Generic', 'Standard replacement battery for iPhone 15. Original capacity with reliable performance.', 50, false, true),
    ('High Capacity Battery for Samsung Galaxy S24 Ultra', 'MDTS-BAT-0104', 64.99, battery_cat_id, 'Generic', 'Extended capacity battery for Samsung Galaxy S24 Ultra. Fast charging support with thermal protection.', 35, false, true),
    ('Premium Battery for Samsung Galaxy S24+', 'MDTS-BAT-0105', 59.99, battery_cat_id, 'Generic', 'Premium quality battery for Samsung Galaxy S24+. Enhanced performance with long service life.', 40, false, true);

    -- Add Camera Variations
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('Front Camera Module for iPhone 15 Pro Max', 'MDTS-CAM-0201', 89.99, camera_cat_id, 'Generic', 'High-resolution front camera module for iPhone 15 Pro Max. Perfect for selfies and Face ID.', 30, false, true),
    ('Rear Camera Module for iPhone 15 Pro', 'MDTS-CAM-0202', 129.99, camera_cat_id, 'Generic', 'Professional rear camera module for iPhone 15 Pro. Crystal clear photos with perfect focus.', 25, true, true),
    ('Ultra Wide Camera for iPhone 15', 'MDTS-CAM-0203', 99.99, camera_cat_id, 'Generic', 'Ultra wide camera module for iPhone 15. Expanded field of view with excellent clarity.', 20, false, true),
    ('Telephoto Camera for iPhone 14 Pro Max', 'MDTS-CAM-0204', 119.99, camera_cat_id, 'Generic', 'Telephoto camera module for iPhone 14 Pro Max. Optical zoom with image stabilization.', 15, false, true),
    ('Front Camera Module for Samsung Galaxy S24 Ultra', 'MDTS-CAM-0205', 79.99, camera_cat_id, 'Generic', 'High-quality front camera module for Samsung Galaxy S24 Ultra. Perfect for selfies and video calls.', 25, false, true);

    -- Add Charging Port Variations
    INSERT INTO products (name, sku, price, category_id, brand, description, stock_quantity, is_featured, is_new)
    VALUES
    ('USB-C Port Assembly for iPhone 15 Pro Max', 'MDTS-CP-0101', 49.99, charging_cat_id, 'Generic', 'USB-C charging port assembly for iPhone 15 Pro Max. Fast charging and data transfer support.', 40, true, true),
    ('USB-C Port Assembly for iPhone 15 Pro', 'MDTS-CP-0102', 47.99, charging_cat_id, 'Generic', 'USB-C charging port assembly for iPhone 15 Pro. Reliable connection with audio support.', 45, false, true),
    ('USB-C Port Assembly for iPhone 15', 'MDTS-CP-0103', 44.99, charging_cat_id, 'Generic', 'USB-C charging port assembly for iPhone 15. Perfect fit with easy installation.', 50, false, true),
    ('USB-C Port Assembly for Samsung Galaxy S24 Ultra', 'MDTS-CP-0104', 39.99, charging_cat_id, 'Generic', 'USB-C charging port assembly for Samsung Galaxy S24 Ultra. Fast charging with data sync capability.', 35, false, true),
    ('USB-C Port Assembly for Samsung Galaxy S24+', 'MDTS-CP-0105', 37.99, charging_cat_id, 'Generic', 'USB-C charging port assembly for Samsung Galaxy S24+. Durable design with perfect fit.', 40, false, true);
END $$;

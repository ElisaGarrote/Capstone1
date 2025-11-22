# Database Seeding Guide

This guide explains how to populate your database with sample data using Django management commands.

## Available Seeder Commands

### 1. Seed Products (10 Records) ⭐ NEW
Populates the database with **10 realistic product records**.

```bash
# Inside the assets container
python manage.py seed_products

# Clear existing products and reseed
python manage.py seed_products --clear
```

**What's included:**
- 3 Laptops (Dell Latitude 5420, HP EliteBook 840 G8, Lenovo ThinkPad X1 Carbon Gen 9)
- 2 Desktops (HP EliteDesk 800 G6, Dell OptiPlex 7090)
- 2 Monitors (Dell UltraSharp U2720Q, LG 27UK850-W)
- 2 Network Equipment (Cisco Catalyst 2960-X, Ubiquiti UniFi Dream Machine Pro)
- 1 Printer (HP LaserJet Pro M404dn)

### 2. Seed Assets (10 Records) ⭐ NEW
Populates the database with **10 realistic asset records**.

```bash
# Inside the assets container
python manage.py seed_assets

# Clear existing assets and reseed
python manage.py seed_assets --clear
```

**What's included:**
- 10 assets created from the first 5 products (2 assets per product)
- Auto-generated asset IDs (AST-YYYYMMDD-XXXXX-RAND)
- Unique serial numbers (SN000001 - SN000010)
- Varied warranty expiration dates (1-3 years)
- Staggered purchase dates
- Realistic purchase costs

**Note:** Requires products to be seeded first. Run `python manage.py seed_products` before seeding assets.

### 3. Seed Components (100 Records)
Populates the database with **100 realistic component records** across 6 categories.

```bash
# Inside the assets container
python manage.py seed_components

# Clear existing components and reseed
python manage.py seed_components --clear
```

**What's included:**
- 15 RAM modules (Kingston, Corsair, Crucial, G.Skill, Samsung, HyperX, Patriot)
- 20 Storage devices (SSDs and HDDs from Samsung, Crucial, WD, Seagate, Kingston, Intel)
- 20 Peripherals (mice, keyboards, webcams, USB hubs, headsets, etc.)
- 15 Power supplies & adapters (laptop chargers, UPS, power strips, USB-C adapters)
- 15 Network equipment (switches, routers, access points, patch panels, PoE)
- 15 Cables & accessories (Ethernet, HDMI, USB-C, DisplayPort, cable management)

### 4. Seed Tickets (100 Records) ⭐ NEW
Populates the database with **100 realistic ticket records** for checkout and checkin requests.

```bash
# Inside the contexts container
docker exec -it contexts-dev python manage.py seed_tickets

# Clear existing tickets and reseed
docker exec -it contexts-dev python manage.py seed_tickets --clear
```

**What's included:**
- 60 Checkout request tickets (60%)
- 40 Checkin request tickets (40%)
- 70% resolved, 30% unresolved
- Realistic employee names and locations
- Varied subjects and dates (last 90 days)
- Random asset assignments

**Note:** This seeder is in the **contexts service**, not the assets service.

### 5. Seed Components Bulk (Randomized)
Creates a custom number of randomized component records.

```bash
# Create 50 random components (default)
python manage.py seed_components_bulk

# Create custom number of components
python manage.py seed_components_bulk --count 200

# Clear existing and create new
python manage.py seed_components_bulk --count 100 --clear
```

**Features:**
- Randomized component names and specifications
- Varied categories (RAM, Storage, Peripherals, Power, Network, Cables)
- Random quantities, prices, and purchase dates
- Useful for testing with large datasets

### 6. Seed All Data
Populates products, assets, components, and tickets with sample data.

```bash
# Seed everything (products + assets + components + tickets)
python manage.py seed_all

# Clear all data and reseed
python manage.py seed_all --clear

# Seed only specific types
python manage.py seed_all --products-only
python manage.py seed_all --assets-only
python manage.py seed_all --components-only
python manage.py seed_all --tickets-only
```

**What's included:**
- 10 Products (laptops, desktops, monitors, network equipment, printers)
- 10 Assets (2 assets for each of the first 5 products)
- 100 Components (calls seed_components command)
- 100 Tickets (calls seed_tickets command in contexts service)

## Running Seeders in Docker

### Method 1: Using docker exec (Recommended)

**Assets Service Seeders:**
```bash
# Seed 10 products
docker exec -it backend-dev python manage.py seed_products

# Seed 10 assets
docker exec -it backend-dev python manage.py seed_assets

# Seed 100 components
docker exec -it backend-dev python manage.py seed_components

# Seed bulk components (custom count)
docker exec -it backend-dev python manage.py seed_components_bulk --count 200

# Seed all data (products + assets + components + tickets)
docker exec -it backend-dev python manage.py seed_all

# Clear and reseed all
docker exec -it backend-dev python manage.py seed_all --clear
```

**Contexts Service Seeders:**
```bash
# Seed 100 tickets (checkout and checkin requests)
docker exec -it contexts-dev python manage.py seed_tickets

# Clear and reseed tickets
docker exec -it contexts-dev python manage.py seed_tickets --clear
```

### Method 2: Using docker-compose exec

**Assets Service:**
```bash
# Seed products
docker-compose -f docker-compose.dev.yml exec assets python manage.py seed_products

# Seed assets
docker-compose -f docker-compose.dev.yml exec assets python manage.py seed_assets

# Seed components
docker-compose -f docker-compose.dev.yml exec assets python manage.py seed_components

# Seed all data
docker-compose -f docker-compose.dev.yml exec assets python manage.py seed_all --clear

# Seed bulk components
docker-compose -f docker-compose.dev.yml exec assets python manage.py seed_components_bulk --count 150
```

**Contexts Service:**
```bash
# Seed tickets
docker-compose -f docker-compose.dev.yml exec contexts python manage.py seed_tickets --clear
```

### Method 3: Inside the Container

**Assets Service:**
```bash
# Enter the assets container
docker exec -it backend-dev bash

# Run seeder commands
python manage.py seed_products
python manage.py seed_assets
python manage.py seed_components
python manage.py seed_components_bulk --count 100
python manage.py seed_all

# Exit container
exit
```

**Contexts Service:**
```bash
# Enter the contexts container
docker exec -it contexts-dev bash

# Run seeder commands
python manage.py seed_tickets

# Exit container
exit
```

### Method 4: Run All Seeders Sequentially

To seed everything in one go:

```bash
# From host machine - Seed all assets service data
docker exec -it backend-dev python manage.py seed_all --clear

# Seed tickets in contexts service
docker exec -it contexts-dev python manage.py seed_tickets --clear

echo 'All seeders completed successfully!'
```

Or run each seeder separately:

```bash
# Seed in order (recommended for first-time setup)
docker exec -it backend-dev python manage.py seed_products
docker exec -it backend-dev python manage.py seed_assets
docker exec -it backend-dev python manage.py seed_components
docker exec -it contexts-dev python manage.py seed_tickets
```

Or use the --only flags:

```bash
# Seed specific data types
docker exec -it backend-dev python manage.py seed_all --products-only
docker exec -it backend-dev python manage.py seed_all --assets-only
docker exec -it backend-dev python manage.py seed_all --components-only
docker exec -it backend-dev python manage.py seed_all --tickets-only
```

## Sample Data Details

### Products (10 items)

**Laptops (3 items):**
- Dell Latitude 5420 - Intel i5-1135G7, 16GB RAM, 512GB SSD, Windows 11 Pro ($1,299.99)
- HP EliteBook 840 G8 - Intel i7-1165G7, 16GB RAM, 512GB SSD, Windows 11 Pro ($1,499.99)
- Lenovo ThinkPad X1 Carbon Gen 9 - Intel i7-1185G7, 16GB RAM, 1TB SSD, Windows 11 Pro ($1,799.99)

**Desktops (2 items):**
- HP EliteDesk 800 G6 - Intel i7-10700, 32GB RAM, 1TB SSD, Windows 11 Pro ($899.99)
- Dell OptiPlex 7090 - Intel i7-11700, 32GB RAM, 512GB SSD, Windows 11 Pro ($1,099.99)

**Monitors (2 items):**
- Dell UltraSharp U2720Q - 27-inch 4K USB-C monitor ($549.99)
- LG 27UK850-W - 27-inch 4K monitor with HDR10 ($499.99)

**Network Equipment (2 items):**
- Cisco Catalyst 2960-X - 24-port managed gigabit switch ($1,899.99)
- Ubiquiti UniFi Dream Machine Pro - All-in-one network security gateway ($379.99)

**Printers (1 item):**
- HP LaserJet Pro M404dn - Monochrome laser printer with duplex ($299.99)

### Assets (10 items)

- 10 assets created from the first 5 products (2 assets per product)
- Auto-generated asset IDs: AST-YYYYMMDD-XXXXX-RAND format
- Serial numbers: SN000001, SN000002, ..., SN000010
- Order numbers: ORD-2024-0001, ORD-2024-0002, ..., ORD-2024-0010
- Warranty expiration: 1-3 years from purchase date
- Purchase dates: Staggered over the last 10 months
- Locations: Split between Location 1 (Main Warehouse) and Location 2 (Secondary Storage)
- Suppliers: Alternating between Supplier 1 and Supplier 2
- Status: All set to Status 1 (Available)

### Components (100 items)

**RAM Components (15 items):**
- Kingston 4GB/8GB/16GB DDR4 (various speeds)
- Corsair Vengeance 8GB/16GB DDR4
- Crucial 8GB/16GB DDR4
- G.Skill Ripjaws 8GB/16GB DDR4
- Samsung 8GB/16GB DDR4
- HyperX Fury 8GB/16GB DDR4
- Patriot Viper 8GB/16GB DDR4

**Storage Components (20 items):**
- Samsung 870 EVO SSDs (250GB, 500GB, 1TB)
- Crucial MX500 SSDs (250GB, 500GB, 1TB)
- Kingston A400 SSDs (240GB, 480GB, 960GB)
- SanDisk SSD Plus (240GB, 480GB)
- WD Blue HDDs (500GB, 1TB, 2TB)
- Seagate Barracuda HDDs (1TB, 2TB)
- Toshiba HDDs (1TB, 2TB)
- Intel 660p NVMe SSDs (512GB, 1TB)

**Peripherals (20 items):**
- Logitech mice (M185, M510), keyboards (K120), combos (MK270)
- Microsoft mice and keyboards (wired and wireless)
- HP and Dell mice and keyboards
- Logitech webcams (C270 HD, C920 Pro)
- USB 3.0 hubs (4-port, 7-port)
- Headsets, presentation remotes, DVD writers, cooling pads

**Power Supplies & Adapters (15 items):**
- Dell AC adapters (65W, 90W)
- HP AC adapters (45W, 65W, 90W)
- Lenovo AC adapters (65W, 90W)
- Universal laptop chargers
- Power strips (6-outlet, 8-outlet)
- UPS battery backups (650VA, 1000VA)
- USB-C power adapters (30W, 65W)
- Desktop PC power supply (500W)

**Network Equipment (15 items):**
- TP-Link switches (5-port, 8-port, 16-port)
- Netgear switches (8-port, 24-port)
- Cisco managed switch (24-port)
- WiFi routers (AC1200, AC1750)
- UniFi access points (AC Lite, AC Pro)
- Network patch panels (24-port, 48-port)
- PoE injectors and switches
- Fiber optic transceivers

**Cables & Accessories (15 items):**
- CAT6 Ethernet cables (3ft, 6ft, 10ft, 25ft, 50ft)
- HDMI cables (6ft, 10ft)
- DisplayPort cables (6ft)
- USB-C cables (USB-A and USB-C)
- VGA and DVI cables
- Audio cables (3.5mm)
- Cable management sleeves and velcro ties

### Tickets (100 items)

**Checkout Requests (60 items - 60%):**
- Ticket numbers: TKT001 - TKT060
- Subjects: "Laptop needed for remote work", "Desktop computer for new employee", "Monitor for dual screen setup", etc.
- Includes checkout_date and return_date
- Random employees from a pool of 20 names
- Random locations from 10 office locations
- Random asset assignments (asset IDs 1-50)
- Created dates: Random within last 90 days
- 70% resolved, 30% unresolved

**Checkin Requests (40 items - 40%):**
- Ticket numbers: TKT061 - TKT100
- Subjects: "Returning laptop after project completion", "Equipment return - employee resignation", etc.
- Includes checkin_date and asset_checkout reference
- References to checkout records (asset_checkout IDs 1-60)
- Random employees and locations
- Created dates: Random within last 90 days
- 70% resolved, 30% unresolved

**Employee Names (20 variations):**
John Smith, Maria Garcia, Robert Johnson, Emily Davis, Michael Brown, Sarah Wilson, David Martinez, Lisa Anderson, James Taylor, Jennifer Thomas, William Moore, Patricia Jackson, Richard White, Linda Harris, Joseph Martin, Elizabeth Thompson, Charles Garcia, Susan Robinson, Christopher Clark, Jessica Rodriguez

**Office Locations (10 variations):**
Makati Office, Pasig Office, Quezon City Office, BGC Office, Ortigas Office, Manila Office, Taguig Office, Mandaluyong Office, San Juan Office, Marikina Office

## Important Notes

⚠️ **Before Seeding:**
1. Make sure migrations are applied: `python manage.py migrate`
2. Ensure you have the required categories, manufacturers, suppliers, and locations in the contexts service
3. The seeder uses placeholder IDs (1, 2, 3, etc.) for foreign key relationships

⚠️ **Required Foreign Key IDs:**

The seeders assume the following IDs exist in your contexts service:

**Categories (1-6):**
1. RAM/Memory
2. Storage
3. Peripherals
4. Power Supplies
5. Network Equipment
6. Cables & Accessories

**Manufacturers (1-33):**
1. Kingston, 2. Corsair, 3. Crucial, 4. G.Skill, 5. Samsung, 6. Patriot, 7. Western Digital, 8. Seagate, 9. SanDisk, 10. Toshiba, 11. Intel, 12. Logitech, 13. Microsoft, 14. HP, 15. Dell, 16. Generic USB, 17. ASUS, 18. Cooler Master, 19. Lenovo, 20. Targus, 21. Belkin, 22. APC, 23. Anker, 24. EVGA, 25. TP-Link, 26. Netgear, 27. Cisco, 28. Ubiquiti, 29. Panduit, 30. Monoprice, 31. Cable Matters, 32. Aukey, 33. Cable Management Co.

**Suppliers (1-2):**
1. Primary Supplier
2. Secondary Supplier

**Locations (1-2):**
1. Main Warehouse
2. Secondary Storage

**Statuses (for Assets):**
1. Available

**Depreciations (for Products):**
1. Standard Depreciation

If these don't exist, you may need to:
1. Create them in the contexts service first
2. Or modify the seeder files to match your existing IDs

## Quick Start - Seed Everything

To seed your database with all sample data in one command:

```bash
# From host machine (recommended)
docker exec -it backend-dev python manage.py seed_all --clear

# This will:
# 1. Clear existing products, components, and assets
# 2. Create 4 products
# 3. Create 100 components
# 4. Create 6 assets
```

## Customizing Seeders

To customize the sample data, edit the files:
- `backend/assets/assets_ms/management/commands/seed_components.py` - 100 predefined components
- `backend/assets/assets_ms/management/commands/seed_components_bulk.py` - Randomized bulk components
- `backend/assets/assets_ms/management/commands/seed_all.py` - Products and assets

You can modify:
- Quantities and minimum quantities
- Purchase costs and dates
- Model numbers and order numbers
- Categories/Manufacturers/Suppliers (update IDs to match your data)
- Add more items to the data arrays
- Change component specifications and notes

## Seeder Command Reference

| Command | Service | Purpose | Records | Key Options |
|---------|---------|---------|---------|-------------|
| `seed_products` | Assets | Create predefined products | 10 | `--clear` |
| `seed_assets` | Assets | Create predefined assets | 10 | `--clear` |
| `seed_components` | Assets | Create predefined components | 100 | `--clear` |
| `seed_tickets` | Contexts | Create checkout/checkin tickets | 100 | `--clear` |
| `seed_components_bulk` | Assets | Create randomized components | Custom | `--count N`, `--clear` |
| `seed_all` | Assets | Seed all data types | 220+ | `--clear`, `--products-only`, `--assets-only`, `--components-only`, `--tickets-only` |

## Troubleshooting

**Error: "No such table"**
- Run migrations first: `python manage.py migrate`

**Error: "Foreign key constraint failed"**
- The referenced category/manufacturer/supplier doesn't exist in the contexts service
- Create the required context items first or update the IDs in the seeder files
- Check that the contexts service is running and accessible

**Error: "Command not found"**
- Make sure you're in the correct directory with manage.py
- Verify the management command files are in `backend/assets/assets_ms/management/commands/`
- Check that `__init__.py` files exist in the management directories

**Error: "Container not found"**
- Make sure Docker containers are running: `docker ps`
- Check container name matches: `docker ps -a | grep backend`
- Start containers if needed: `docker-compose -f docker-compose.dev.yml up -d`

**Components not appearing:**
- Check that foreign key IDs exist in contexts service
- Verify the seeder completed without errors
- Check database: `docker exec -it backend-dev python manage.py shell`
  ```python
  from assets_ms.models import Component
  print(Component.objects.count())
  ```

## Integration with Entrypoint

To automatically seed data when containers start, you can modify `entrypoint.sh`:

```bash
echo "Running migrations..."
python manage.py migrate --noinput

# Seed data on first run (optional)
# Only seeds if data doesn't already exist (uses get_or_create)
python manage.py seed_all

echo "Starting assets service..."
python manage.py runserver 0.0.0.0:8002
```

**Note:** The seeders use `get_or_create()` logic to prevent duplicates, so running them multiple times is safe.

## Performance Tips

- **For development:** Use `seed_components` (100 items) for realistic data
- **For testing:** Use `seed_components_bulk --count 1000` for large datasets
- **For demos:** Use `seed_all` for complete sample data with products and assets
- **Clear data:** Always use `--clear` flag when you want to start fresh

## Next Steps

After seeding:
1. Verify data in Django admin or API endpoints
2. Test filtering, searching, and pagination with the seeded data
3. Create additional custom seeders for your specific use cases
4. Update foreign key IDs to match your contexts service data


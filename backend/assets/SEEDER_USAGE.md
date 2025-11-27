# Updated Seeders - 100 Products & 100 Assets

## Overview

The seeders have been updated to generate **100 products** and **100 assets** with proper foreign key relationship integrity and **automatic dependency handling**.

## What's Changed

### Products Seeder (`seed_products.py`)
- **Now creates:** 100 products (previously 10)
- **Distribution:**
  - 40 Laptops (Category 1)
  - 25 Desktops (Category 2)
  - 15 Monitors (Category 3)
  - 10 Network Equipment (Category 4)
  - 10 Printers (Category 5)

**Features:**
- Randomized product names from realistic templates
- Varied specifications (CPU, GPU, RAM, Storage, OS)
- Random pricing within realistic ranges
- Unique model numbers for each product
- Random end-of-life dates (3-10 years depending on category)

### Assets Seeder (`seed_assets.py`)
- **Now creates:** 100 assets (previously 10)
- **Relationship:** Each asset is linked to a product via foreign key
- **Distribution:** Assets are distributed across all available products
- **🆕 Auto-seeds products:** Automatically seeds products if they don't exist

**Features:**
- **Automatic dependency handling:** Auto-seeds products if none exist
- Each asset references a valid product (maintains referential integrity)
- Randomized statuses (Available, In Use, Under Repair, Retired, Lost/Stolen)
- Varied suppliers (1-3) and locations (1-5)
- Unique serial numbers (SN000001 to SN000100)
- Random purchase dates within the past 2 years
- Warranty expiration dates (1-3 years from purchase)
- Purchase costs with ±10% variation from product default cost

### Seed All Command (`seed_all.py`)
- **Updated counts:** Now reflects 100 records for products and assets
- **🆕 Smart dependency handling:** Automatically seeds products when using `--assets-only` flag
- **Updated help text:** Shows correct record counts for each seeder

## How to Use

### Option 1: Use the seed_all Command (Recommended)

```bash
# Seed everything (products, assets, components)
docker exec -it backend-dev python manage.py seed_all --clear

# Seed only products
docker exec -it backend-dev python manage.py seed_all --products-only --clear

# Seed only assets (will auto-seed products if they don't exist)
docker exec -it backend-dev python manage.py seed_all --assets-only --clear

# Seed only components
docker exec -it backend-dev python manage.py seed_all --components-only --clear
```

### Option 2: Individual Commands

**Seed Products Only:**
```bash
docker exec -it backend-dev python manage.py seed_products --clear
```

**Seed Assets Only (will auto-seed products if they don't exist):**
```bash
docker exec -it backend-dev python manage.py seed_assets --clear
```

**Seed Assets Without Auto-Seeding Products:**
```bash
docker exec -it backend-dev python manage.py seed_assets --clear --no-auto-seed-products
```

### Option 3: Seed Both Manually

```bash
# Seed products first
docker exec -it backend-dev python manage.py seed_products --clear

# Then seed assets
docker exec -it backend-dev python manage.py seed_assets --clear
```

## Important Notes

1. **🆕 Automatic Dependency Handling:**
   - Assets seeder now **automatically seeds products** if they don't exist
   - You can run `seed_assets` directly without worrying about products
   - Use `--no-auto-seed-products` flag to disable this behavior

2. **The `--clear` flag:**
   - Deletes all existing records before seeding
   - Use with caution in production environments
   - Omit this flag to add records without deleting existing ones

3. **Relationship Integrity:**
   - Each asset has a valid `product` foreign key
   - The seeder checks for product existence before creating assets
   - If fewer than 100 products exist, assets will be distributed across available products

4. **Randomization:**
   - Product and asset data is randomized on each run
   - Serial numbers and order numbers are sequential and unique
   - Model numbers are unique per product

5. **Smart Seeding with seed_all:**
   - Using `--assets-only` flag will automatically check and seed products if needed
   - All flags now show correct record counts (100 for products and assets)

## Verification

After seeding, you can verify the data:

```bash
# Check product count
docker exec -it backend-dev python manage.py shell -c "from assets_ms.models import Product; print(f'Products: {Product.objects.count()}')"

# Check asset count
docker exec -it backend-dev python manage.py shell -c "from assets_ms.models import Asset; print(f'Assets: {Asset.objects.count()}')"

# Verify all assets have valid products
docker exec -it backend-dev python manage.py shell -c "from assets_ms.models import Asset; print(f'Assets with products: {Asset.objects.filter(product__isnull=False).count()}')"
```

## Example Output

```
=== Seeding 100 Products ===
✓ Created 10 products...
✓ Created 20 products...
✓ Created 30 products...
...
✓ Created 100 products...

✓ Products seeding complete: 100 created

=== Seeding 100 Assets ===
✓ Created 10 assets...
✓ Created 20 assets...
✓ Created 30 assets...
...
✓ Created 100 assets...

✓ Assets seeding complete: 100 created
```

## Troubleshooting

**Error: "No products found"**
- Solution: Run `python manage.py seed_products` first

**Duplicate entries**
- Solution: Use the `--clear` flag to remove existing records before seeding

**Foreign key constraint errors**
- Solution: Ensure products are seeded before assets


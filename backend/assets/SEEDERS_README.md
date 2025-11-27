# Database Seeders - Complete Guide

## 🎯 Overview

This project includes intelligent database seeders that create **100 products** and **100 assets** with automatic dependency handling.

### Key Features
- ✅ **100 Products** across 5 categories
- ✅ **100 Assets** with foreign key relationships to products
- ✅ **🆕 Auto-dependency handling** - No need to seed products manually
- ✅ **Referential integrity** - All relationships are valid
- ✅ **Realistic data** - Random but realistic specifications and pricing

---

## 🚀 Quick Start

### Simplest Way (Recommended)
```bash
# This one command does everything
docker exec -it backend-dev python manage.py seed_assets --clear
```
**What happens:** Automatically seeds 100 products (if needed), then 100 assets.

### Using seed_all
```bash
# Seed everything
docker exec -it backend-dev python manage.py seed_all --clear

# Seed only assets (auto-seeds products if needed)
docker exec -it backend-dev python manage.py seed_all --assets-only --clear

# Seed only products
docker exec -it backend-dev python manage.py seed_all --products-only --clear
```

---

## 📊 What Gets Created

### Products (100 Total)
| Category | Count | Examples |
|----------|-------|----------|
| Laptops | 40 | Dell Latitude, HP EliteBook, Lenovo ThinkPad |
| Desktops | 25 | HP EliteDesk, Dell OptiPlex, Lenovo ThinkCentre |
| Monitors | 15 | Dell UltraSharp, LG 4K, Samsung ViewFinity |
| Network Equipment | 10 | Cisco Catalyst, Ubiquiti UniFi, Netgear ProSafe |
| Printers | 10 | HP LaserJet, Canon imageCLASS, Epson WorkForce |

**Product Features:**
- Unique model numbers
- Realistic specifications (CPU, GPU, RAM, Storage, OS)
- Random pricing within category ranges
- End-of-life dates (3-10 years)

### Assets (100 Total)
- **Serial Numbers:** SN000001 to SN000100
- **Order Numbers:** ORD-2024-0001 to ORD-2024-0100
- **Statuses:** Available, In Use, Under Repair, Retired, Lost/Stolen
- **Suppliers:** 1-3 (randomized)
- **Locations:** 1-5 (randomized)
- **Purchase Dates:** Random within past 2 years
- **Warranty:** 1-3 years from purchase date
- **Cost:** Product default ±10% variation

---

## 🔧 Advanced Usage

### Disable Auto-Seeding
If you want the old behavior (manual product seeding):
```bash
docker exec -it backend-dev python manage.py seed_assets --clear --no-auto-seed-products
```

### Seed Without Clearing
Add records without deleting existing ones:
```bash
docker exec -it backend-dev python manage.py seed_assets
```

### Individual Commands
```bash
# Products only
docker exec -it backend-dev python manage.py seed_products --clear

# Assets only (with auto-seeding)
docker exec -it backend-dev python manage.py seed_assets --clear

# Components only
docker exec -it backend-dev python manage.py seed_components --clear
```

---

## 📁 Available Commands

| Command | Records | Auto-Seeds Dependencies | Description |
|---------|---------|------------------------|-------------|
| `seed_products` | 100 | No | Creates products only |
| `seed_assets` | 100 | **Yes** (products) | Creates assets, auto-seeds products if needed |
| `seed_components` | 100 | No | Creates components |
| `seed_all` | 300+ | **Yes** (smart) | Seeds everything with dependency handling |

---

## ✅ Verification

After seeding, verify the data:

```bash
# Check counts
docker exec -it backend-dev python manage.py shell -c "from assets_ms.models import Product, Asset; print(f'Products: {Product.objects.count()}, Assets: {Asset.objects.count()}')"

# Expected output: Products: 100, Assets: 100

# Verify relationships
docker exec -it backend-dev python manage.py shell -c "from assets_ms.models import Asset; print(f'Assets with valid products: {Asset.objects.filter(product__isnull=False).count()}')"

# Expected output: Assets with valid products: 100
```

---

## 🎓 How Auto-Dependency Works

When you run `seed_assets`:

1. **Check:** Does the database have products?
2. **If No:** Automatically run `seed_products` to create 100 products
3. **If Yes:** Use existing products
4. **Then:** Create 100 assets linked to those products

This means you can run `seed_assets` anytime without worrying about products!

---

## 📚 Documentation Files

- **`QUICK_REFERENCE.md`** - Quick command reference
- **`SEEDER_USAGE.md`** - Comprehensive usage guide
- **`CHANGELOG_SEEDERS.md`** - Version history and changes
- **`SEEDER_UPDATE_SUMMARY.md`** - Detailed technical summary
- **`test_seeders.ps1`** - Windows test script
- **`test_seeders.sh`** - Linux/Mac test script

---

## 🐛 Troubleshooting

**Q: I get "No products found" error**  
A: This should not happen with auto-seeding. If it does, you may have used `--no-auto-seed-products` flag.

**Q: I want to seed products manually**  
A: Use `--no-auto-seed-products` flag or run `seed_products` separately.

**Q: Can I seed more than 100 records?**  
A: Yes, modify the range in the seeder files or run the command multiple times without `--clear`.

**Q: Are the relationships maintained?**  
A: Yes! Every asset has a valid product foreign key. This is guaranteed.

---

## 🎉 Summary

**Before:** Had to manually seed products, then assets (2 commands)  
**Now:** Just run `seed_assets` and it handles everything (1 command)

**Simple, smart, and maintains data integrity!**


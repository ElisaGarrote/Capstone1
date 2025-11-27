# Context Seeders - Complete Guide

## 🎯 Overview

This project includes database seeders for all context models with realistic data.

### What Gets Seeded
- ✅ **10 Categories** (5 asset, 5 component)
- ✅ **10 Suppliers** (Philippine IT suppliers)
- ✅ **10 Manufacturers** (Major IT brands)
- ✅ **10 Statuses** (2 per status type)
- ✅ **10 Depreciations** (Various schedules)
- ✅ **10 Locations** (Metro Manila offices)
- ✅ **100 Tickets** (50 checkout, 50 checkin)

---

## 🚀 Quick Start

### Simplest Way (Seed Everything)
```bash
docker exec -it backend-dev python manage.py seed_all_contexts --clear
```

### Individual Seeders
```bash
# Categories (10 records)
docker exec -it backend-dev python manage.py seed_categories --clear

# Suppliers (10 records)
docker exec -it backend-dev python manage.py seed_suppliers --clear

# Manufacturers (10 records)
docker exec -it backend-dev python manage.py seed_manufacturers --clear

# Statuses (10 records)
docker exec -it backend-dev python manage.py seed_statuses --clear

# Depreciations (10 records)
docker exec -it backend-dev python manage.py seed_depreciations --clear

# Locations (10 records)
docker exec -it backend-dev python manage.py seed_locations --clear

# Tickets (100 records)
docker exec -it backend-dev python manage.py seed_tickets --clear
```

---

## 📊 What Gets Created

### Categories (10 Total)

**Asset Categories (5):**
- Laptops
- Desktops
- Monitors
- Network Equipment
- Printers

**Component Categories (5):**
- Hard Drives
- Memory (RAM)
- Processors (CPU)
- Graphics Cards
- Power Supplies

### Suppliers (10 Total)
Philippine-based IT suppliers with complete contact information:
- Tech Solutions Inc. (Makati)
- Global IT Distributors (Pasig)
- Office Equipment Pro (Taguig)
- Computer World Manila (Quezon City)
- Enterprise Tech Supply (Mandaluyong)
- Digital Solutions Hub (Mandaluyong)
- Network Systems Corp (Makati)
- PC Parts Warehouse (Mandaluyong)
- Business Tech Partners (Makati)
- Smart IT Resources (Pasig)

### Manufacturers (10 Total)
Major IT equipment manufacturers:
- Dell Technologies
- HP Inc.
- Lenovo
- Apple Inc.
- ASUS
- Cisco Systems
- Ubiquiti Networks
- Samsung Electronics
- LG Electronics
- Canon Inc.

### Statuses (10 Total)
2 statuses for each type:
- **Deployable:** Ready to Deploy, Available
- **Deployed:** In Use, Checked Out
- **Undeployable:** Under Repair, Broken
- **Pending:** Pending Approval, In Transit
- **Archived:** Retired, Lost/Stolen

### Depreciations (10 Total)
Various depreciation schedules:
- Computer Equipment (3 & 5 years)
- Laptops, Desktops, Servers
- Network Equipment, Printers, Monitors
- Mobile Devices, Peripherals

### Locations (10 Total)
Metro Manila office locations:
- Makati, Pasig, Quezon City, Taguig, Mandaluyong
- Manila, San Juan, Marikina, Parañaque, Las Piñas

### Tickets (100 Total)
- 50 Checkout requests
- 50 Checkin requests
- Random dates within last 90 days
- 30% resolved, 70% unresolved

---

## 🔧 Advanced Usage

### Seed Specific Data Only
```bash
# Categories only
docker exec -it backend-dev python manage.py seed_all_contexts --categories-only --clear

# Suppliers only
docker exec -it backend-dev python manage.py seed_all_contexts --suppliers-only --clear

# Manufacturers only
docker exec -it backend-dev python manage.py seed_all_contexts --manufacturers-only --clear

# Statuses only
docker exec -it backend-dev python manage.py seed_all_contexts --statuses-only --clear

# Depreciations only
docker exec -it backend-dev python manage.py seed_all_contexts --depreciations-only --clear

# Locations only
docker exec -it backend-dev python manage.py seed_all_contexts --locations-only --clear

# Tickets only
docker exec -it backend-dev python manage.py seed_all_contexts --tickets-only --clear
```

### Seed Without Clearing
Add records without deleting existing ones:
```bash
docker exec -it backend-dev python manage.py seed_all_contexts
```

---

## 📁 Available Commands

| Command | Records | Description |
|---------|---------|-------------|
| `seed_categories` | 10 | 5 asset + 5 component categories |
| `seed_suppliers` | 10 | Philippine IT suppliers |
| `seed_manufacturers` | 10 | Major IT brands |
| `seed_statuses` | 10 | 2 per status type |
| `seed_depreciations` | 10 | Various depreciation schedules |
| `seed_locations` | 10 | Metro Manila offices |
| `seed_tickets` | 100 | 50 checkout + 50 checkin |
| `seed_all_contexts` | 160 | All of the above |

---

## ✅ Summary

**Total Records:** 160 (60 context records + 100 tickets)

All seeders include:
- Realistic data
- Proper validation
- Duplicate prevention
- Progress indicators
- Clear success/warning messages

**Simple, complete, and ready to use!**


#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contexts.settings')
sys.path.insert(0, '/app')
django.setup()

from contexts_ms.services.usage_check import is_item_in_use
from contexts_ms.models import Category

print("=" * 60)
print("Testing category deletion usage check")
print("=" * 60)

# Test category 103
cat_id = 103
print(f"\n1. Testing category {cat_id} (should be in use)...")
try:
    cat = Category.objects.get(id=cat_id, is_deleted=False)
    print(f"   Category found: {cat.name}")
except Category.DoesNotExist:
    print(f"   Category {cat_id} not found or deleted")

result = is_item_in_use('category', cat_id)
print(f"   In use: {result['in_use']}")
print(f"   Asset IDs: {result['asset_ids']}")
print(f"   Component IDs: {result['component_ids']}")
print(f"   Repair IDs: {result['repair_ids']}")

# Test category 104 (should not be in use)
cat_id = 104
print(f"\n2. Testing category {cat_id} (should NOT be in use)...")
try:
    cat = Category.objects.get(id=cat_id, is_deleted=False)
    print(f"   Category found: {cat.name}")
except Category.DoesNotExist:
    print(f"   Category {cat_id} not found or deleted")

result = is_item_in_use('category', cat_id)
print(f"   In use: {result['in_use']}")
print(f"   Asset IDs: {result['asset_ids']}")

print("\n" + "=" * 60)

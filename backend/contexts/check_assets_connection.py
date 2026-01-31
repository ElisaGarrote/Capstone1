#!/usr/bin/env python3
"""
Diagnostic script to check connection to assets service from contexts service.
Run this in your Railway contexts service environment to verify connectivity.
"""
import os
import sys
import requests

# Get ASSETS_API_URL from environment
ASSETS_API_URL = os.getenv("ASSETS_API_URL", "")

print("="*60)
print("ASSETS SERVICE CONNECTION DIAGNOSTIC")
print("="*60)
print(f"ASSETS_API_URL environment variable: '{ASSETS_API_URL}'")
print()

if not ASSETS_API_URL:
    print("❌ ERROR: ASSETS_API_URL is not set!")
    print("   This will cause all usage checks to fail.")
    print("   Set this in Railway to the internal service URL")
    print("   Example: http://assets:8002/ (for docker-compose)")
    print("   Example: https://assets-service.railway.internal:8002/ (for Railway)")
    sys.exit(1)

print(f"✓ ASSETS_API_URL is set to: {ASSETS_API_URL}")
print()

# Test connectivity
print("Testing connection to assets service...")
print()

test_endpoints = [
    ("Health Check", f"{ASSETS_API_URL}"),
    ("Assets List", f"{ASSETS_API_URL}assets/"),
    ("Products List", f"{ASSETS_API_URL}products/"),
    ("Components List", f"{ASSETS_API_URL}components/"),
]

for name, url in test_endpoints:
    try:
        print(f"Testing {name}: {url}")
        response = requests.get(url, timeout=5)
        print(f"  ✓ Status: {response.status_code}")
        if response.status_code == 200:
            print(f"  ✓ Response received (content length: {len(response.content)} bytes)")
        else:
            print(f"  ⚠ Unexpected status code")
    except requests.exceptions.Timeout:
        print(f"  ❌ Timeout - service not responding within 5 seconds")
    except requests.exceptions.ConnectionError as e:
        print(f"  ❌ Connection Error: {e}")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    print()

print("="*60)
print("DIAGNOSIS COMPLETE")
print("="*60)
print()
print("If you see connection errors above:")
print("1. Verify ASSETS_API_URL is correct in Railway dashboard")
print("2. Ensure assets service is deployed and running")
print("3. Check Railway service networking/private networking is enabled")
print("4. For Railway, use: https://<service-name>.railway.internal:<port>/")

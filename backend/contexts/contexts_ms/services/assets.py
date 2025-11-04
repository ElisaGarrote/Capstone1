import os
import requests

ASSETS_API_URL = os.getenv("ASSETS_API_URL", "http://assets:8002/")

def get_deleted_assets():
    response = requests.get(f"{ASSETS_API_URL}assets/deleted/")
    response.raise_for_status()
    return response.json()

def get_deleted_components():
    response = requests.get(f"{ASSETS_API_URL}components/deleted/")
    response.raise_for_status()
    return response.json()

def recover_asset(asset_id):
    response = requests.patch(f"{ASSETS_API_URL}assets/{asset_id}/recover/")
    response.raise_for_status()
    return response.json()

def recover_component(component_id):
    response = requests.patch(f"{ASSETS_API_URL}components/{component_id}/recover/")
    response.raise_for_status()
    return response.json()

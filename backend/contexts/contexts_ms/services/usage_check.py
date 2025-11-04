import requests

ASSETS_SERVICE_URL = "http://assets-service:8002/"  # adjust to your internal service name + port

def is_item_in_use(item_type, item_id):
    """
    Checks the assets-service if this item is still being used
    before deletion in the contexts-service.
    """

    endpoint_map = {
        "supplier": f"{ASSETS_SERVICE_URL}/suppliers/{item_id}/check-usage/",
        "manufacturer": f"{ASSETS_SERVICE_URL}/manufacturers/{item_id}/check-usage/",
        "depreciation": f"{ASSETS_SERVICE_URL}/depreciations/{item_id}/check-usage/",
    }

    url = endpoint_map.get(item_type)
    if not url:
        return False

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json().get("in_use", False)
        return False
    except requests.RequestException:
        # If the assets-service is unreachable, assume item is in use
        # to prevent accidental deletion.
        return True

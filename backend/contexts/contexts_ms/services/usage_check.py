import requests
from urllib.parse import urlencode

ASSETS_SERVICE_URL = "http://assets-service:8002/"  # adjust to your internal service name + port


def _extract_ids_from_response(resp_json):
    """Normalize possible list response shapes into a list of ids."""
    ids = []
    if isinstance(resp_json, list):
        for item in resp_json:
            if isinstance(item, dict) and 'id' in item:
                ids.append(item['id'])
    elif isinstance(resp_json, dict):
        # DRF paginated responses often have 'results'
        results = resp_json.get('results') or resp_json.get('data') or None
        if isinstance(results, list):
            for item in results:
                if isinstance(item, dict) and 'id' in item:
                    ids.append(item['id'])
    return ids


def _extract_asset_identifiers(resp_json):
    """Extract asset identifiers (human-facing asset_id strings) when available.

    Looks for common identifier fields like 'asset_id', 'assetId', 'identifier',
    'serial' and falls back to the numeric 'id'. Returns a list of strings.
    """
    ids = []
    def pick_identifier(item):
        if not isinstance(item, dict):
            return None
        for key in ('asset_id', 'assetId', 'assetIdentifier', 'identifier', 'serial'):
            if key in item and item[key]:
                return str(item[key])
        # fall back to numeric id
        if 'id' in item:
            return str(item['id'])
        return None

    if isinstance(resp_json, list):
        for item in resp_json:
            val = pick_identifier(item)
            if val:
                ids.append(val)
    elif isinstance(resp_json, dict):
        results = resp_json.get('results') or resp_json.get('data') or None
        if isinstance(results, list):
            for item in results:
                val = pick_identifier(item)
                if val:
                    ids.append(val)
    return ids


def _get_results_list(resp_json):
    """Return the list of item dicts from a response payload."""
    if isinstance(resp_json, list):
        return resp_json
    if isinstance(resp_json, dict):
        results = resp_json.get('results') or resp_json.get('data') or None
        if isinstance(results, list):
            return results
    return []


def is_item_in_use(item_type, item_id):
    """
    Check usage of an item across assets, components and repairs.

    Behavior:
    - Try a dedicated check-usage endpoint if available (supplier/manufacturer/depreciation).
    - If the endpoint reports in_use=True or no endpoint exists, attempt to query
      the assets service list endpoints to find referencing object ids.
    - On network error, conservatively assume the item is in use (return in_use=True).
    """

    result = {'in_use': False, 'asset_ids': [], 'component_ids': [], 'repair_ids': []}

    # Known check-usage endpoints on the assets service
    endpoint_map = {
        'supplier': f"{ASSETS_SERVICE_URL}suppliers/{item_id}/check-usage/",
        'manufacturer': f"{ASSETS_SERVICE_URL}manufacturers/{item_id}/check-usage/",
        'depreciation': f"{ASSETS_SERVICE_URL}depreciations/{item_id}/check-usage/",
    }

    try:
        check_url = endpoint_map.get(item_type)
        if check_url:
            resp = requests.get(check_url, timeout=5)
            if resp.status_code == 200:
                if resp.json().get('in_use'):
                    result['in_use'] = True
                else:
                    return result

        # If we reach here either the check endpoint reported in_use=True
        # or no dedicated check exists. Attempt to locate referencing objects.

        # Map item_type to query param used by assets endpoints.
        param_name = item_type
        # Common endpoints to search
        searches = [
            ('asset_ids', f"{ASSETS_SERVICE_URL}assets/?{param_name}={item_id}"),
            ('component_ids', f"{ASSETS_SERVICE_URL}components/?{param_name}={item_id}"),
            ('repair_ids', f"{ASSETS_SERVICE_URL}repairs/?{param_name}={item_id}"),
        ]

        for key, url in searches:
            try:
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    resp_json = r.json()
                    items = _get_results_list(resp_json)
                    # filter items that actually reference the item_id on the param_name
                    # some services may ignore query params, so we verify here
                    filtered = [it for it in items if it.get(param_name) == item_id]
                    if not filtered:
                        # if nothing matched by strict equality, try string comparison
                        filtered = [it for it in items if str(it.get(param_name)) == str(item_id)]

                    if filtered:
                        if key == 'asset_ids':
                            ids = _extract_asset_identifiers(filtered)
                        else:
                            ids = _extract_ids_from_response(filtered)
                        if ids:
                            result[key] = ids
                            result['in_use'] = True
            except requests.RequestException:
                # ignore this particular failure and continue; we'll treat unreachable
                # overall as in_use=True later
                continue

        # Special handling: some contexts (category, manufacturer, depreciation)
        if item_type in ('category', 'manufacturer', 'depreciation'):
            try:
                prod_param = item_type
                prod_url = f"{ASSETS_SERVICE_URL}products/?{prod_param}={item_id}"
                pr = requests.get(prod_url, timeout=5)
                if pr.status_code == 200:
                    prod_json = pr.json()
                    prods = _get_results_list(prod_json)
                    # Build product id list and map for quick lookup (keep product dicts if available)
                    prod_map = {p.get('id'): p for p in prods if isinstance(p, dict) and p.get('id')}
                    prod_ids = list(prod_map.keys())

                    # For each product id, fetch assets and validate that the asset indeed
                    # references the same product AND that, if present, the product's
                    # depreciation/manufacturer/category matches the requested context.
                    asset_identifiers = []
                    for pid in prod_ids:
                        # Ensure we have product details that include the context field
                        prod_obj = prod_map.get(pid)
                        if not prod_obj or prod_obj.get(item_type) is None:
                            # Try to fetch full product detail as a fallback
                            try:
                                pdetail = requests.get(f"{ASSETS_SERVICE_URL}products/{pid}/", timeout=5)
                                if pdetail.status_code == 200:
                                    prod_obj = pdetail.json()
                            except requests.RequestException:
                                # If we can't fetch product detail, conservatively keep prod_obj as-is
                                prod_obj = prod_obj

                        # If product object is present and has the context field, ensure it matches
                        if isinstance(prod_obj, dict):
                            ctx_field = prod_obj.get(item_type)
                            if ctx_field is not None and str(ctx_field) != str(item_id):
                                # product doesn't actually reference this context value
                                continue
                        try:
                            ar = requests.get(f"{ASSETS_SERVICE_URL}assets/?product={pid}", timeout=5)
                            if ar.status_code != 200:
                                continue
                            ajson = ar.json()
                            aitems = _get_results_list(ajson)

                            for a in aitems:
                                # Extract product id from the asset's product field which
                                # may be an int, string, or nested dict.
                                prod_field = a.get('product')
                                pid_in_asset = None
                                prod_obj = None
                                if isinstance(prod_field, dict):
                                    pid_in_asset = prod_field.get('id') or prod_field.get('pk')
                                    prod_obj = prod_field
                                else:
                                    pid_in_asset = prod_field

                                if pid_in_asset is None:
                                    # can't verify this asset's product, skip it
                                    continue

                                # Ensure product id matches the product we asked for
                                if str(pid_in_asset) != str(pid):
                                    continue

                                # If the asset includes nested product info, prefer that
                                if prod_obj and isinstance(prod_obj, dict):
                                    # For depreciation/manufacturer/category checks
                                    # validate the product's field if present.
                                    if item_type == 'depreciation':
                                        dep_field = prod_obj.get('depreciation')
                                        if dep_field is not None and str(dep_field) != str(item_id):
                                            # product's depreciation doesn't match; skip
                                            continue
                                    if item_type == 'manufacturer':
                                        man_field = prod_obj.get('manufacturer')
                                        if man_field is not None and str(man_field) != str(item_id):
                                            continue
                                    if item_type == 'category':
                                        cat_field = prod_obj.get('category')
                                        if cat_field is not None and str(cat_field) != str(item_id):
                                            continue

                                # Passed checks; extract asset identifier
                                idval = None
                                for key in ('asset_id', 'assetId', 'assetIdentifier', 'identifier', 'serial'):
                                    if key in a and a.get(key):
                                        idval = str(a.get(key))
                                        break
                                if not idval and 'id' in a:
                                    idval = str(a.get('id'))
                                if idval:
                                    asset_identifiers.append(idval)
                        except requests.RequestException:
                            continue

                    # deduplicate while preserving order
                    seen = set()
                    unique_assets = []
                    for x in asset_identifiers:
                        if x not in seen:
                            seen.add(x)
                            unique_assets.append(x)

                    if unique_assets:
                        result['asset_ids'].extend(unique_assets)
                        result['in_use'] = True
            except requests.RequestException:
                # conservative behavior on network problems
                result['in_use'] = True

        return result
    except requests.RequestException:
        # If the assets-service is unreachable, assume item is in use
        # to prevent accidental deletion.
        return {'in_use': True, 'asset_ids': [], 'component_ids': [], 'repair_ids': []}

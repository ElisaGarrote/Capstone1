import requests
import logging
from .http_client import get as client_get

logger = logging.getLogger(__name__)


def _extract_ids_from_response(resp_json):
    """Normalize possible list response shapes into a list of ids."""
    ids = []
    if isinstance(resp_json, list):
        for item in resp_json:
            if isinstance(item, dict):
                # Prefer human-readable name/title when available (components, statuses, etc.)
                for key in ('name', 'title', 'component_name', 'label'):
                    if key in item and item.get(key):
                        ids.append(str(item.get(key)))
                        break
                else:
                    if 'id' in item:
                        ids.append(item['id'])
    elif isinstance(resp_json, dict):
        # DRF paginated responses often have 'results'
        results = resp_json.get('results') or resp_json.get('data') or None
        if isinstance(results, list):
            for item in results:
                if isinstance(item, dict):
                    for key in ('name', 'title', 'component_name', 'label'):
                        if key in item and item.get(key):
                            ids.append(str(item.get(key)))
                            break
                    else:
                        if 'id' in item:
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
    from .http_client import ASSETS_API_URL
    logger.info(f"[usage_check] ==================== USAGE CHECK START ====================")
    logger.info(f"[usage_check] Checking usage for {item_type}#{item_id}")
    logger.info(f"[usage_check] ASSETS_API_URL={ASSETS_API_URL}")

    result = {'in_use': False, 'asset_ids': [], 'component_ids': [], 'repair_ids': []}

    # Known check-usage endpoints on the assets service (relative paths)
    endpoint_map = {
        'supplier': f"suppliers/{item_id}/check-usage/",
        'manufacturer': f"manufacturers/{item_id}/check-usage/",
        'depreciation': f"depreciations/{item_id}/check-usage/",
    }

    try:
        had_network_error = False
        check_path = endpoint_map.get(item_type)
        if check_path:
            try:
                resp = client_get(check_path, timeout=5)
            except requests.RequestException:
                resp = None
                had_network_error = True

            if resp is not None and resp.status_code == 200:
                if resp.json().get('in_use'):
                    result['in_use'] = True
                else:
                    return result

        # If we reach here either the check endpoint reported in_use=True
        # or no dedicated check exists. Attempt to locate referencing objects.

        # Special handling: some contexts (category, manufacturer, depreciation)
        # For categories, skip the general queries and use direct count-based approach
        if item_type == 'category':
            logger.info(f"[usage_check] Starting special handling for category#{item_id}")
            logger.info(f"[usage_check] Querying assets with category={item_id}")
            asset_count = 0
            try:
                ar = client_get('assets/', params={'category': item_id, 'page_size': 1}, timeout=5)
                logger.info(f"[usage_check] Assets query status: {ar.status_code}")
                if ar.status_code == 200:
                    ajson = ar.json()
                    logger.info(f"[usage_check] Assets response type: {type(ajson)}, keys: {ajson.keys() if isinstance(ajson, dict) else 'N/A'}")
                    
                    # Extract count from paginated response
                    if isinstance(ajson, dict) and 'count' in ajson:
                        asset_count = int(ajson.get('count', 0))
                    else:
                        # Fallback: count results list
                        asset_count = len(_get_results_list(ajson))
                    
                    logger.info(f"[usage_check] Found {asset_count} assets with category={item_id}")
                    if asset_count > 0:
                        result['in_use'] = True
                        result['asset_ids'] = [f"asset_{i}" for i in range(min(asset_count, 5))]  # Placeholder IDs
                else:
                    logger.warning(f"[usage_check] Assets query failed with status {ar.status_code}")
            except requests.RequestException as exc:
                logger.error(f"[usage_check] Network error querying assets by category: {exc}")
                had_network_error = True

            logger.info(f"[usage_check] Querying components with category={item_id}")
            comp_count = 0
            try:
                cr = client_get('components/', params={'category': item_id, 'page_size': 1}, timeout=5)
                logger.info(f"[usage_check] Components query status: {cr.status_code}")
                if cr.status_code == 200:
                    cjson = cr.json()
                    logger.info(f"[usage_check] Components response type: {type(cjson)}, keys: {cjson.keys() if isinstance(cjson, dict) else 'N/A'}")
                    
                    # Extract count from paginated response
                    if isinstance(cjson, dict) and 'count' in cjson:
                        comp_count = int(cjson.get('count', 0))
                    else:
                        # Fallback: count results list
                        comp_count = len(_get_results_list(cjson))
                    
                    logger.info(f"[usage_check] Found {comp_count} components with category={item_id}")
                    if comp_count > 0:
                        result['in_use'] = True
                        result['component_ids'] = [f"component_{i}" for i in range(min(comp_count, 5))]  # Placeholder IDs
                else:
                    logger.warning(f"[usage_check] Components query failed with status {cr.status_code}")
            except requests.RequestException as exc:
                logger.error(f"[usage_check] Network error querying components by category: {exc}")
                had_network_error = True

            if result['in_use']:
                asset_ids_count = len(result.get('asset_ids', []))
                comp_ids_count = len(result.get('component_ids', []))
                logger.info(f"[usage_check] category#{item_id} is in use: asset_count={asset_count}, comp_count={comp_count}, asset_ids={asset_ids_count}, comp_ids={comp_ids_count}")
                if asset_ids_count > 0 and comp_ids_count > 0:
                    logger.info(f"[usage_check] category#{item_id} blocked: has both assets and components")
                elif asset_ids_count > 0:
                    logger.info(f"[usage_check] category#{item_id} blocked: has assets")
                elif comp_ids_count > 0:
                    logger.info(f"[usage_check] category#{item_id} blocked: has components")
            else:
                logger.info(f"[usage_check] category#{item_id} not in use: asset_count={asset_count}, comp_count={comp_count}, in_use=False")
            
            # Check for network errors - only block if we don't have valid query results
            if not result['in_use'] and had_network_error:
                logger.warning(f"[usage_check] Network error checking category#{item_id} BUT blocking delete as safety measure")
                result['in_use'] = True
                result['network_error'] = True
            
            # Return immediately after category handling - don't continue to general checks
            logger.info(f"[usage_check] category#{item_id} FINAL DECISION: in_use={result['in_use']}, assets={len(result.get('asset_ids', []))}, components={len(result.get('component_ids', []))}, had_network_error={had_network_error}")
            logger.info(f"[usage_check] ==================== USAGE CHECK END ====================")
            return result
        
        # For non-category items or manufacturer/depreciation, use general queries
        elif item_type not in ('category',):
            # Map item_type to query param used by assets endpoints.
            param_name = item_type
            # Common endpoints to search (relative paths)
            searches = [
                ('asset_ids', 'assets/'),
                ('component_ids', 'components/'),
                ('repair_ids', 'repairs/'),
            ]

            for key, path in searches:
                try:
                    r = client_get(path, params={param_name: item_id}, timeout=5)
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
                                logger.info(f"[usage_check] {item_type}#{item_id} is in use by {len(ids)} {key.replace('_ids', '')}(s)")
                except requests.RequestException:
                    # record network issue and continue; we'll be conservative later
                    had_network_error = True
                    continue

            # Special handling for manufacturer and depreciation through products
            if item_type in ('manufacturer', 'depreciation'):
                logger.info(f"[usage_check] Starting special handling for {item_type}#{item_id}")
                # For manufacturer and depreciation, use the products-based approach
                try:
                    prod_param = item_type
                    logger.info(f"[usage_check] Querying products with {prod_param}={item_id}")
                    pr = client_get('products/', params={prod_param: item_id}, timeout=5)
                    logger.info(f"[usage_check] Products query status: {pr.status_code}")
                    if pr.status_code == 200:
                        prod_json = pr.json()
                        prods = _get_results_list(prod_json)
                        logger.info(f"[usage_check] Found {len(prods)} products with {item_type}={item_id}")
                        # Build product id list and map for quick lookup (keep product dicts if available)
                        prod_map = {p.get('id'): p for p in prods if isinstance(p, dict) and p.get('id')}
                        prod_ids = list(prod_map.keys())
                        logger.info(f"[usage_check] Product IDs to check: {prod_ids}")

                        # For each product id, fetch assets and validate that the asset indeed
                        # references the same product AND that, if present, the product's
                        # depreciation/manufacturer/category matches the requested context.
                        asset_identifiers = []
                        for pid in prod_ids:
                            logger.info(f"[usage_check] Checking product {pid} for assets")
                            # Ensure we have product details that include the context field
                            prod_obj = prod_map.get(pid)
                            if not prod_obj or prod_obj.get(item_type) is None:
                                # Try to fetch full product detail as a fallback
                                try:
                                    pdetail = client_get(f'products/{pid}/', timeout=5)
                                    if pdetail.status_code == 200:
                                        prod_obj = pdetail.json()
                                except requests.RequestException:
                                    # If we can't fetch product detail, record network error and keep prod_obj as-is
                                    had_network_error = True
                                    prod_obj = prod_obj

                            # If product object is present and has the context field, ensure it matches
                            if isinstance(prod_obj, dict):
                                ctx_field = prod_obj.get(item_type)
                                if ctx_field is not None and str(ctx_field) != str(item_id):
                                    # product doesn't actually reference this context value
                                    continue
                            try:
                                ar = client_get('assets/', params={'product': pid}, timeout=5)
                                logger.info(f"[usage_check] Assets query for product {pid}: status={ar.status_code}")
                                if ar.status_code != 200:
                                    continue
                                ajson = ar.json()
                                aitems = _get_results_list(ajson)
                                logger.info(f"[usage_check] Found {len(aitems)} assets for product {pid}")

                                for a in aitems:
                                    # Extract product id from the asset's product field which
                                    # may be an int, string, or nested dict.
                                    prod_field = a.get('product')
                                    pid_in_asset = None
                                    prod_obj_nested = None
                                    if isinstance(prod_field, dict):
                                        pid_in_asset = prod_field.get('id') or prod_field.get('pk')
                                        prod_obj_nested = prod_field
                                    else:
                                        pid_in_asset = prod_field

                                    if pid_in_asset is None:
                                        # can't verify this asset's product, skip it
                                        continue

                                    # Ensure product id matches the product we asked for
                                    if str(pid_in_asset) != str(pid):
                                        continue

                                    # If the asset includes nested product info, prefer that
                                    if prod_obj_nested and isinstance(prod_obj_nested, dict):
                                        # For depreciation/manufacturer/category checks
                                        # validate the product's field if present.
                                        if item_type == 'depreciation':
                                            dep_field = prod_obj_nested.get('depreciation')
                                            if dep_field is not None and str(dep_field) != str(item_id):
                                                # product's depreciation doesn't match; skip
                                                continue
                                        if item_type == 'manufacturer':
                                            man_field = prod_obj_nested.get('manufacturer')
                                            if man_field is not None and str(man_field) != str(item_id):
                                                continue
                                        if item_type == 'category':
                                            cat_field = prod_obj_nested.get('category')
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
                                had_network_error = True
                                continue

                            # Also check for components that use this product
                            try:
                                cr = client_get('components/', params={'product': pid}, timeout=5)
                                logger.info(f"[usage_check] Components query for product {pid}: status={cr.status_code}")
                                if cr.status_code == 200:
                                    cjson = cr.json()
                                    citems = _get_results_list(cjson)
                                    logger.info(f"[usage_check] Found {len(citems)} components for product {pid}")

                                    for c in citems:
                                        # Extract product id from component's product field
                                        prod_field = c.get('product')
                                        pid_in_comp = None
                                        prod_obj_nested = None
                                        if isinstance(prod_field, dict):
                                            pid_in_comp = prod_field.get('id') or prod_field.get('pk')
                                            prod_obj_nested = prod_field
                                        else:
                                            pid_in_comp = prod_field

                                        if pid_in_comp is None:
                                            continue

                                        # Ensure product id matches
                                        if str(pid_in_comp) != str(pid):
                                            continue

                                        # Validate nested product context field if present
                                        if prod_obj_nested and isinstance(prod_obj_nested, dict):
                                            if item_type == 'depreciation':
                                                dep_field = prod_obj_nested.get('depreciation')
                                                if dep_field is not None and str(dep_field) != str(item_id):
                                                    continue
                                            if item_type == 'manufacturer':
                                                man_field = prod_obj_nested.get('manufacturer')
                                                if man_field is not None and str(man_field) != str(item_id):
                                                    continue
                                            if item_type == 'category':
                                                cat_field = prod_obj_nested.get('category')
                                                if cat_field is not None and str(cat_field) != str(item_id):
                                                    continue

                                        # Extract component identifier
                                        idval = None
                                        for key in ('component_id', 'componentId', 'name', 'serial'):
                                            if key in c and c.get(key):
                                                idval = str(c.get(key))
                                                break
                                        if not idval and 'id' in c:
                                            idval = str(c.get('id'))
                                        if idval:
                                            # Add to component_ids instead of asset_ids
                                            if 'component_ids' not in result:
                                                result['component_ids'] = []
                                            result['component_ids'].append(idval)
                            except requests.RequestException:
                                had_network_error = True
                                continue

                        # deduplicate while preserving order
                        seen = set()
                        unique_assets = []
                        for x in asset_identifiers:
                            if x not in seen:
                                seen.add(x)
                                unique_assets.append(x)

                        # Deduplicate components too
                        seen_comp = set()
                        unique_components = []
                        for x in result.get('component_ids', []):
                            if x not in seen_comp:
                                seen_comp.add(x)
                                unique_components.append(x)

                        if unique_assets:
                            result['asset_ids'].extend(unique_assets)
                            result['in_use'] = True
                            logger.info(f"[usage_check] {item_type}#{item_id} is in use by {len(unique_assets)} assets from products")
                        
                        if unique_components:
                            result['component_ids'] = unique_components
                            result['in_use'] = True
                            logger.info(f"[usage_check] {item_type}#{item_id} is in use by {len(unique_components)} components from products")
                        
                        if not unique_assets and not unique_components:
                            logger.info(f"[usage_check] {item_type}#{item_id} not in use by assets or components (checked {len(prod_ids)} products)")
                except requests.RequestException as exc:
                    # conservative behavior on network problems
                    logger.error(f"[usage_check] Network error in special handling for {item_type}#{item_id}: {exc}")
                    result['in_use'] = True
                    result['network_error'] = True
                except Exception as exc:
                    # Catch ANY other exception and block delete as safety measure
                    logger.error(f"[usage_check] Unexpected error in special handling for {item_type}#{item_id}: {type(exc).__name__}: {exc}")
                    logger.exception(exc)  # Full traceback
                    result['in_use'] = True
                    result['network_error'] = True

        # If we encountered network errors but found no explicit references, be conservative
        # Better to block a delete that should succeed than allow one that shouldn't
        if not result['in_use'] and had_network_error:
            logger.warning(f"[usage_check] Network error checking {item_type}#{item_id}, blocking delete as safety measure")
            return {'in_use': True, 'asset_ids': [], 'component_ids': [], 'repair_ids': [], 'network_error': True}

        logger.info(f"[usage_check] {item_type}#{item_id} final result: in_use={result['in_use']}, assets={len(result.get('asset_ids', []))}, components={len(result.get('component_ids', []))}, repairs={len(result.get('repair_ids', []))}")
        logger.info(f"[usage_check] ==================== USAGE CHECK END ====================")
        return result
    except requests.RequestException as exc:
        # If the assets-service is unreachable, assume item is in use
        # to prevent accidental deletion.
        logger.error(f"[usage_check] Assets service unreachable for {item_type}#{item_id}: {exc}")
        return {'in_use': True, 'asset_ids': [], 'component_ids': [], 'repair_ids': [], 'network_error': True}

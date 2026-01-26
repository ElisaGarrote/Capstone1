"""
Forecast Service - Provides predictive analytics for the dashboard.

This service calculates:
1. Asset Status Forecast - Historical and forecasted counts by status type
2. Product Demand Forecast - Historical and forecasted demand by product/model
3. KPI Summary - Key performance indicators and trends

Uses linear regression on actual historical data for accurate trend forecasting.
"""

from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from django.db.models import Count, Sum, F, Q
from django.db.models.functions import TruncMonth, Coalesce
from django.utils.timezone import now
from collections import defaultdict

from ..models import Asset, AssetCheckout, Product, Component


def _to_date(value):
    """Convert a datetime or date to a date object."""
    if hasattr(value, 'date'):
        return value.date()
    return value


def get_month_label(dt):
    """Get abbreviated month name from date."""
    return dt.strftime('%b')


def _linear_regression(data_points):
    """
    Calculate linear regression (least squares) for forecasting.

    Args:
        data_points: List of (x, y) tuples where x is the time index and y is the value

    Returns:
        tuple: (slope, intercept) for the line y = slope * x + intercept
               Returns (0, average) if not enough data points
    """

    """if not enough data points, return average as intercept"""
    if not data_points or len(data_points) < 2:
        avg = sum(y for _, y in data_points) / len(data_points) if data_points else 0
        return (0, avg)

    n = len(data_points)
    sum_x = sum(x for x, _ in data_points)
    sum_y = sum(y for _, y in data_points)
    sum_xy = sum(x * y for x, y in data_points)
    sum_x2 = sum(x * x for x, _ in data_points)

    # Calculate slope and intercept using least squares formula
    denominator = n * sum_x2 - sum_x * sum_x
    if denominator == 0:
        return (0, sum_y / n)

    slope = (n * sum_xy - sum_x * sum_y) / denominator
    intercept = (sum_y - slope * sum_x) / n

    return (slope, intercept)


def _forecast_value(slope, intercept, x, min_value=0):
    """
    Calculate forecasted value at position x.

    Args:
        slope: The slope from linear regression
        intercept: The intercept from linear regression
        x: The time index to forecast for
        min_value: Minimum allowed value (default 0)

    Returns:
        int: The forecasted value, clamped to min_value
    """
    return max(min_value, int(round(slope * x + intercept)))


def _calculate_trend_percentage(historical_values, forecast_value):
    """
    Calculate the percentage change from average historical to forecast.

    Args:
        historical_values: List of historical values
        forecast_value: The forecasted value

    Returns:
        float: Percentage change
    """
    if not historical_values:
        return 0.0

    avg_historical = sum(historical_values) / len(historical_values)
    if avg_historical == 0:
        return 0.0 if forecast_value == 0 else 100.0

    return round(((forecast_value - avg_historical) / avg_historical) * 100, 1)


def get_asset_status_forecast(months_back=6, months_forward=3):
    """
    Calculate asset status forecast data using linear regression on actual historical data.

    Returns CUMULATIVE monthly counts of assets by status type at the end of each month:
    - Available: Total assets with status type 'deployable' or 'pending' at end of month
    - Deployed: Total assets with status type 'deployed' at end of month
    - Unavailable: Total assets with status type 'undeployable' or 'archived' at end of month

    Uses linear regression on historical cumulative counts for forecasting.

    Note: Since we don't track status history, we use checkout records to determine
    deployed status historically, and estimate available/unavailable based on current ratios.
    """
    from ..services.contexts import get_status_names_assets

    today = now().date()

    # Get all status mappings
    statuses = get_status_names_assets()
    if isinstance(statuses, dict) and statuses.get('warning'):
        statuses = []

    # Build status type mapping: {status_id: type}
    status_type_map = {}
    for s in statuses:
        status_type_map[s['id']] = s.get('type', 'unknown')

    # Get current asset counts by status type (for table data)
    assets_by_status = Asset.objects.filter(is_deleted=False).values('status').annotate(count=Count('id'))

    # Group by status type
    type_counts = {'deployable': 0, 'deployed': 0, 'undeployable': 0, 'pending': 0, 'archived': 0}
    for item in assets_by_status:
        status_type = status_type_map.get(item['status'], 'unknown')
        if status_type in type_counts:
            type_counts[status_type] += item['count']

    # Current totals for table data
    # Available = deployable + pending status types
    current_available = type_counts.get('deployable', 0) + type_counts.get('pending', 0)
    # Deployed = deployed status type
    current_deployed = type_counts.get('deployed', 0)
    # Unavailable = undeployable + archived status types
    current_unavailable = type_counts.get('undeployable', 0) + type_counts.get('archived', 0)

    # Calculate current ratio of unavailable to non-deployed assets
    # This ratio is used to estimate historical unavailable counts
    current_non_deployed = current_available + current_unavailable
    unavailable_ratio = current_unavailable / current_non_deployed if current_non_deployed > 0 else 0

    # Build historical data arrays for regression
    available_history = []
    deployed_history = []
    unavailable_history = []
    chart_data = []

    # For each historical month, calculate cumulative counts at end of that month
    for i in range(months_back - 1, -1, -1):  # 5,4,3,2,1,0 (0 = current month)
        month_date = today - relativedelta(months=i)
        # End of month = last day of that month
        month_end = (month_date.replace(day=1) + relativedelta(months=1)) - relativedelta(days=1)
        month_label = get_month_label(month_date)
        time_index = months_back - 1 - i  # 0, 1, 2, 3, 4, 5

        # Count total assets created by end of this month (not deleted)
        total_assets_by_month_end = Asset.objects.filter(
            is_deleted=False,
            created_at__date__lte=month_end
        ).count()

        # Count assets that were checked out (deployed) at end of this month
        # An asset is deployed if it has a checkout where:
        # - checkout_date <= month_end AND (return_date is NULL OR return_date > month_end)
        deployed_count = AssetCheckout.objects.filter(
            checkout_date__lte=month_end
        ).filter(
            Q(return_date__isnull=True) | Q(return_date__gt=month_end)
        ).values('asset_id').distinct().count()

        # Non-deployed assets = Total - Deployed
        non_deployed = max(0, total_assets_by_month_end - deployed_count)

        # Estimate unavailable and available based on current ratio
        # Since we don't track status history, we assume the ratio stays similar
        unavailable_count = int(non_deployed * unavailable_ratio)
        available_count = non_deployed - unavailable_count

        # Store for regression (x = time index, y = value)
        available_history.append((time_index, available_count))
        deployed_history.append((time_index, deployed_count))
        unavailable_history.append((time_index, unavailable_count))

        chart_data.append({
            'month': month_label,
            'available': available_count,
            'deployed': deployed_count,
            'unavailable': unavailable_count,
            'forecastAvailable': available_count,
            'forecastDeployed': deployed_count,
            'forecastUnavailable': unavailable_count,
        })

    # Calculate linear regression for each metric
    available_slope, available_intercept = _linear_regression(available_history)
    deployed_slope, deployed_intercept = _linear_regression(deployed_history)
    unavailable_slope, unavailable_intercept = _linear_regression(unavailable_history)

    # Forecast future months using linear regression
    for i in range(1, months_forward + 1):
        month_date = today + relativedelta(months=i)
        month_label = get_month_label(month_date)

        # x position for forecast (continuing from historical)
        x = months_back + i - 1

        forecast_available = _forecast_value(available_slope, available_intercept, x)
        forecast_deployed = _forecast_value(deployed_slope, deployed_intercept, x)
        forecast_unavailable = _forecast_value(unavailable_slope, unavailable_intercept, x)

        chart_data.append({
            'month': month_label,
            'available': None,
            'deployed': None,
            'unavailable': None,
            'forecastAvailable': forecast_available,
            'forecastDeployed': forecast_deployed,
            'forecastUnavailable': forecast_unavailable,
        })

    # Generate table data with current counts and forecast
    last_forecast = chart_data[-1] if chart_data else {}
    forecast_available = last_forecast.get('forecastAvailable', 0)
    forecast_deployed = last_forecast.get('forecastDeployed', 0)
    forecast_unavailable = last_forecast.get('forecastUnavailable', 0)

    def get_trend(current, forecast):
        """Calculate trend based on comparing current to forecast values."""
        if forecast > current:
            return 'up'
        elif forecast < current:
            return 'down'
        return 'stable'

    table_data = [
        {
            'status': 'Available',
            'currentCount': current_available,
            'forecastCount': forecast_available,
            'trend': get_trend(current_available, forecast_available)
        },
        {
            'status': 'Deployed',
            'currentCount': current_deployed,
            'forecastCount': forecast_deployed,
            'trend': get_trend(current_deployed, forecast_deployed)
        },
        {
            'status': 'Unavailable',
            'currentCount': current_unavailable,
            'forecastCount': forecast_unavailable,
            'trend': get_trend(current_unavailable, forecast_unavailable)
        },
    ]

    return {
        'chartData': chart_data,
        'tableData': table_data,
    }


def get_product_demand_forecast(months_back=6, months_forward=3, top_n=5):
    """
    Calculate product demand forecast data using linear regression.

    Returns historical and forecasted checkout demand per product model,
    using actual historical data and linear regression for accurate forecasting.
    """
    today = now().date()
    start_date = today - relativedelta(months=months_back)

    # Get top products by checkout count
    top_products = list(
        AssetCheckout.objects
        .filter(checkout_date__gte=start_date)
        .values('asset__product__name', 'asset__product_id')
        .annotate(total_checkouts=Count('id'))
        .order_by('-total_checkouts')[:top_n]
    )

    # If no checkouts, fall back to products with most assets
    if not top_products:
        from django.db.models import Q
        top_products = list(
            Product.objects
            .filter(is_deleted=False)
            .annotate(asset_count=Count('product_assets', filter=Q(product_assets__is_deleted=False)))
            .order_by('-asset_count')[:top_n]
            .values('name', 'id')
        )
        top_products = [{'asset__product__name': p['name'], 'asset__product_id': p['id']} for p in top_products]

    product_names = [p['asset__product__name'] or f"Product {p['asset__product_id']}" for p in top_products]
    product_ids = [p['asset__product_id'] for p in top_products]

    # Get ACTUAL monthly checkout counts per product
    monthly_product_checkouts = (
        AssetCheckout.objects
        .filter(
            checkout_date__gte=start_date,
            checkout_date__lte=today,
            asset__product_id__in=product_ids
        )
        .annotate(month=TruncMonth('checkout_date'))
        .values('month', 'asset__product_id', 'asset__product__name')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    # Build data structure: {month: {product_id: count}}
    monthly_data = defaultdict(lambda: defaultdict(int))
    for item in monthly_product_checkouts:
        month_date = _to_date(item['month'])
        monthly_data[month_date][item['asset__product_id']] = item['count']

    # Build historical data for each product (for regression)
    product_history = {pid: [] for pid in product_ids}
    chart_data = []

    # Helper to generate consistent forecast key from product name
    def get_forecast_key(name):
        import re
        return f"forecast_{re.sub(r'[^a-zA-Z0-9]', '_', name)}"

    # Historical months - collect actual data
    for i in range(months_back, 0, -1):
        month_date = today - relativedelta(months=i)
        month_start = month_date.replace(day=1)
        month_label = get_month_label(month_start)
        time_index = months_back - i  # 0, 1, 2, ...

        row = {'month': month_label}

        for idx, product_id in enumerate(product_ids):
            product_name = product_names[idx]
            # Use ACTUAL data - 0 if no checkouts that month
            count = monthly_data.get(month_start, {}).get(product_id, 0)

            # Store for regression
            product_history[product_id].append((time_index, count))

            row[product_name] = count
            row[get_forecast_key(product_name)] = count

        chart_data.append(row)

    # Calculate linear regression for each product
    product_trends = {}
    for product_id in product_ids:
        slope, intercept = _linear_regression(product_history[product_id])
        product_trends[product_id] = (slope, intercept)

    # Forecast future months using linear regression
    for i in range(1, months_forward + 1):
        month_date = today + relativedelta(months=i)
        month_label = get_month_label(month_date)
        time_index = months_back + i - 1

        row = {'month': month_label}

        for idx, product_id in enumerate(product_ids):
            product_name = product_names[idx]
            row[product_name] = None  # No historical data for future

            # Forecast using linear regression
            slope, intercept = product_trends[product_id]
            forecast = _forecast_value(slope, intercept, time_index)

            row[get_forecast_key(product_name)] = forecast

        chart_data.append(row)

    # Generate table data with actual trend analysis
    table_data = []
    for idx, product_id in enumerate(product_ids):
        product_name = product_names[idx]

        # Current demand = last historical month's actual value
        current = chart_data[months_back - 1].get(product_name, 0) if months_back > 0 and chart_data else 0

        # Forecast demand = last forecast month
        last_row = chart_data[-1] if chart_data else {}
        forecast = last_row.get(get_forecast_key(product_name), current)

        # Ensure values are integers
        current = current or 0
        forecast = forecast or 0

        # Calculate trend by comparing current to forecast values
        # This is more intuitive than using regression slope
        if current == 0 and forecast == 0:
            trend = 'stable'
        elif forecast > current:
            trend = 'up'
        elif forecast < current:
            trend = 'down'
        else:
            trend = 'stable'

        table_data.append({
            'productName': product_name,
            'currentDemand': current,
            'forecastDemand': forecast,
            'trend': trend
        })

    return {
        'chartData': chart_data,
        'tableData': table_data,
        'productNames': product_names,
    }


def get_kpi_summary():
    """
    Calculate KPI summary data for the forecast insights section.

    Uses actual historical data with linear regression for accurate forecasting.

    Returns 4 key insights:
    1. Forecasted Total Demand - Predicted total asset checkouts for next period
    2. Most Requested Model - Product/model with highest predicted demand
    3. Expected Shortage Risk - Risk level based on demand vs availability
    4. Predicted Status Change - Net change in deployed asset count
    """
    from ..services.contexts import get_status_names_assets

    today = now().date()
    months_back = 6  # Use 6 months of historical data
    months_forward = 1  # Forecast 1 month ahead (immediate next month)
    start_date = today - relativedelta(months=months_back)

    # Get all status mappings
    statuses = get_status_names_assets()
    if isinstance(statuses, dict) and statuses.get('warning'):
        statuses = []

    # Build status type mapping: {status_id: type}
    status_type_map = {}
    for s in statuses:
        status_type_map[s['id']] = s.get('type', 'unknown')

    # Get current asset counts by status type
    assets = Asset.objects.filter(is_deleted=False).values('status').annotate(count=Count('id'))

    # Group by status type
    type_counts = {'deployable': 0, 'deployed': 0, 'undeployable': 0, 'pending': 0, 'archived': 0}
    for item in assets:
        status_type = status_type_map.get(item['status'], 'unknown')
        if status_type in type_counts:
            type_counts[status_type] += item['count']

    # Current inventory stats
    current_available = type_counts.get('deployable', 0) + type_counts.get('pending', 0)
    current_deployed = type_counts.get('deployed', 0)
    total_assets = Asset.objects.filter(is_deleted=False).count()

    # ========== KPI 1: FORECASTED TOTAL DEMAND ==========
    # Get actual monthly checkout counts
    monthly_checkouts = list(
        AssetCheckout.objects
        .filter(checkout_date__gte=start_date, checkout_date__lte=today)
        .annotate(month=TruncMonth('checkout_date'))
        .values('month')
        .annotate(checkout_count=Count('id'))
        .order_by('month')
    )

    # Build regression data for demand
    demand_history = []
    for idx, item in enumerate(monthly_checkouts):
        demand_history.append((idx, item['checkout_count']))

    # Calculate current month's demand (last 30 days)
    last_30_days = today - relativedelta(days=30)
    current_demand = AssetCheckout.objects.filter(
        checkout_date__gte=last_30_days,
        checkout_date__lte=today
    ).count()

    # Forecast future demand using linear regression
    if demand_history:
        demand_slope, demand_intercept = _linear_regression(demand_history)
        forecast_x = len(demand_history) + months_forward - 1
        forecast_demand = _forecast_value(demand_slope, demand_intercept, forecast_x)
        demand_change = _calculate_trend_percentage([y for _, y in demand_history], forecast_demand)
    else:
        forecast_demand = current_demand
        demand_change = 0.0

    # ========== KPI 2: MOST REQUESTED MODEL ==========
    # Get the Product with the highest combined checkout count across ALL its assets
    # This aggregates: AssetCheckout -> Asset -> Product
    # Example: If Product A has 3 assets with 4+3+3=10 checkouts,
    #          and Product B has 2 assets with 8+7=15 checkouts,
    #          then Product B is the most requested model

    top_products = list(
        AssetCheckout.objects
        .filter(checkout_date__gte=start_date)
        .values(
            'asset__product_id',
            'asset__product__name',
            'asset__product__model_number'
        )
        .annotate(total_checkouts=Count('id'))  # Count all checkouts for this product
        .order_by('-total_checkouts')[:5]
    )

    most_requested_model = "N/A"
    model_current_demand = 0
    model_forecast_demand = 0
    model_change = 0.0
    product_id = None

    if top_products:
        top_product = top_products[0]
        product_id = top_product['asset__product_id']
        product_name = top_product['asset__product__name'] or "Unknown"
        model_number = top_product['asset__product__model_number']

        # Display as "Product Name (Model Number)" if model_number exists
        if model_number:
            most_requested_model = f"{product_name} ({model_number})"
        else:
            most_requested_model = product_name

        # Get monthly breakdown for this Product (all checkouts across all its assets)
        product_monthly = list(
            AssetCheckout.objects
            .filter(
                checkout_date__gte=start_date,
                checkout_date__lte=today,
                asset__product_id=product_id  # Filter by Product ID
            )
            .annotate(month=TruncMonth('checkout_date'))
            .values('month')
            .annotate(count=Count('id'))  # Count all checkouts for this product per month
            .order_by('month')
        )

        product_history = [(idx, item['count']) for idx, item in enumerate(product_monthly)]
        if product_history:
            model_current_demand = product_history[-1][1] if product_history else 0
            slope, intercept = _linear_regression(product_history)
            model_forecast_demand = _forecast_value(slope, intercept, len(product_history) + months_forward - 1)
            model_change = _calculate_trend_percentage([y for _, y in product_history], model_forecast_demand)

    # ========== KPI 3: EXPECTED SHORTAGE RISK ==========
    # Calculate risk based on: forecast demand vs available inventory
    # Risk = (Forecast Demand / Available Assets) * 100

    if current_available > 0:
        demand_ratio = (forecast_demand / current_available) * 100
    else:
        demand_ratio = 100.0 if forecast_demand > 0 else 0.0

    # Determine risk level and score
    if demand_ratio >= 80:
        risk_level = "High"
        risk_score = min(100, int(demand_ratio))
    elif demand_ratio >= 50:
        risk_level = "Medium"
        risk_score = int(demand_ratio)
    elif demand_ratio >= 25:
        risk_level = "Low"
        risk_score = int(demand_ratio)
    else:
        risk_level = "Minimal"
        risk_score = max(0, int(demand_ratio))

    # Calculate change in risk (compare to last period's ratio)
    prev_30_days_start = last_30_days - relativedelta(days=30)
    prev_demand = AssetCheckout.objects.filter(
        checkout_date__gte=prev_30_days_start,
        checkout_date__lt=last_30_days
    ).count()

    if prev_demand > 0 and current_available > 0:
        prev_ratio = (prev_demand / current_available) * 100
        risk_change = demand_ratio - prev_ratio
    else:
        risk_change = 0.0

    # ========== KPI 4: PREDICTED STATUS CHANGE ==========
    # Net change in deployed assets (checkouts - returns)
    monthly_returns = list(
        AssetCheckout.objects
        .filter(return_date__gte=start_date, return_date__lte=today)
        .annotate(month=TruncMonth('return_date'))
        .values('month')
        .annotate(return_count=Count('id'))
        .order_by('month')
    )

    checkout_by_month = {_to_date(item['month']): item['checkout_count'] for item in monthly_checkouts}
    returns_by_month = {_to_date(item['month']): item['return_count'] for item in monthly_returns}

    # Calculate net change history
    net_change_history = []
    all_months = sorted(set(list(checkout_by_month.keys()) + list(returns_by_month.keys())))

    for idx, month in enumerate(all_months):
        checkouts = checkout_by_month.get(month, 0)
        returns = returns_by_month.get(month, 0)
        net = checkouts - returns
        net_change_history.append((idx, net))

    # Current net change (this month)
    current_month_start = today.replace(day=1)
    current_month_checkouts = checkout_by_month.get(current_month_start, 0)
    current_month_returns = returns_by_month.get(current_month_start, 0)
    current_net_change = current_month_checkouts - current_month_returns

    # Forecast net change
    if net_change_history:
        net_slope, net_intercept = _linear_regression(net_change_history)
        forecast_net_change = _forecast_value(net_slope, net_intercept, len(net_change_history) + months_forward - 1, min_value=-1000)
        avg_net = sum(y for _, y in net_change_history) / len(net_change_history)
        if abs(avg_net) > 0.1:
            net_change_pct = ((forecast_net_change - avg_net) / abs(avg_net)) * 100
        else:
            net_change_pct = 0.0
    else:
        forecast_net_change = current_net_change
        net_change_pct = 0.0

    # ========== BUILD KPI DATA ==========
    kpi_data = [
        {
            'title': 'Forecasted Total Demand',
            'subtitle': 'Predicted checkouts next period',
            'description': 'Total number of asset checkout requests expected in the next forecast period, based on historical trends.',
            'currentCount': current_demand,
            'forecastCount': forecast_demand,
            'value': str(forecast_demand),
            'unit': 'checkouts',
            'change': round(demand_change, 1),
            'insight': f"Based on {len(demand_history)} months of data, demand is {'increasing' if demand_change > 0 else 'decreasing' if demand_change < 0 else 'stable'}."
        },
        {
            'title': 'Most Requested Model',
            'subtitle': most_requested_model,
            'description': 'The product (model) with the highest combined checkout count across all its assets.',
            'currentCount': model_current_demand,
            'forecastCount': model_forecast_demand,
            'value': most_requested_model,
            'unit': 'checkouts',
            'change': round(model_change, 1),
            'insight': f"This product has {model_current_demand} checkouts this month across all its assets. {'Expect increased demand.' if model_change > 0 else 'Demand is stabilizing.'}"
        },
        {
            'title': 'Expected Shortage Risk',
            'subtitle': f'{risk_level} Risk',
            'description': 'Risk assessment comparing forecasted demand against available inventory. High risk indicates potential stockouts.',
            'currentCount': current_available,
            'forecastCount': risk_score,
            'value': f'{risk_score}%',
            'unit': 'risk score',
            'change': round(risk_change, 1),
            'riskLevel': risk_level,
            'insight': f"{current_available} assets available vs {forecast_demand} forecasted demand. {'Consider procurement.' if risk_level in ['High', 'Medium'] else 'Inventory levels healthy.'}"
        },
        {
            'title': 'Predicted Status Change',
            'subtitle': 'Net deployed asset change',
            'description': 'Predicted net change in deployed assets (checkouts minus returns). Positive means more assets going out than coming back.',
            'currentCount': current_net_change,
            'forecastCount': forecast_net_change,
            'value': f"{'+' if forecast_net_change >= 0 else ''}{forecast_net_change}",
            'unit': 'net change',
            'change': round(net_change_pct, 1),
            'insight': f"{'More assets being checked out than returned.' if forecast_net_change > 0 else 'More assets returning than going out.' if forecast_net_change < 0 else 'Checkouts and returns balanced.'}"
        },
    ]

    return kpi_data


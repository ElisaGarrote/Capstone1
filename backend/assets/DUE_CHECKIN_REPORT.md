# Due for Check-in Report

## Overview
The Due for Check-in Report displays all assets that are overdue for check-in. An asset is considered overdue when its expected return date has passed and it has not yet been checked in.

## API Endpoints

### Get Full Report
```
GET /due-checkin-report/
```

Returns a list of all assets that are overdue for check-in.

**Response:**
```json
{
  "success": true,
  "count": 22,
  "data": [
    {
      "checkout_id": 1,
      "asset_id": "100015",
      "asset_name": "Surface Laptop 5",
      "asset_display": "100015 - Surface Laptop 5",
      "checked_out_by": "Demo User",
      "checked_out_to": "Mary Grace Plattos",
      "checkout_date": "2025-09-09",
      "return_date": "2025-09-14",
      "days_overdue": 140,
      "ticket_number": "TX001",
      "location_id": 1
    }
  ]
}
```

### Get Overdue Count
```
GET /due-checkin-report/count/
```

Returns just the count of overdue assets (useful for dashboard metrics).

**Response:**
```json
{
  "success": true,
  "count": 22
}
```

## Data Fields

| Field | Description |
|-------|-------------|
| `checkout_id` | Internal ID of the checkout record |
| `asset_id` | Asset identification number |
| `asset_name` | Name of the asset (product name) |
| `asset_display` | Combined display format: "AssetID - Asset Name" |
| `checked_out_by` | Employee who initiated the checkout ticket |
| `checked_out_to` | Employee who currently has the asset |
| `checkout_date` | Date the asset was checked out |
| `return_date` | Expected return date (due date) |
| `days_overdue` | Number of days past the return date |
| `ticket_number` | Associated ticket number from the contexts service |
| `location_id` | Location where the asset was checked out |

## Business Logic

1. **Overdue Condition**: An asset checkout is considered overdue when:
   - `return_date < current_date`
   - No corresponding check-in record exists (`asset_checkin__isnull=True`)

2. **Data Sources**:
   - Primary: `AssetCheckout` model in assets service
   - Employee details: Help Desk service via contexts proxy
   - Ticket details: Contexts service ticket records

3. **Sorting**: Results are ordered by `return_date` (oldest overdue items first)

## Frontend Display

The report should display in a table format with:
- **ASSET**: Asset ID and name (e.g., "100015 - Surface Laptop 5")
- **CHECKED OUT BY**: Employee who created the checkout ticket
- **CHECKED OUT TO**: Employee currently holding the asset
- **CHECKOUT DATE**: Date the checkout occurred
- **CHECKIN DATE**: Expected return date (displayed in red to indicate overdue)

### Visual Indicators
- Dates in red indicate overdue status
- Consider adding a "Days Overdue" column for better visibility

## Integration

### In Django Views
```python
from assets_ms.services.due_checkin_report import get_due_checkin_report, get_due_checkin_count

# Get full report
report_data = get_due_checkin_report()

# Get count only
count = get_due_checkin_count()
```

### In Frontend (JavaScript/React)
```javascript
// Fetch the report
const response = await fetch('/due-checkin-report/');
const data = await response.json();

// Display in table
data.data.forEach(item => {
  console.log(`${item.asset_display} is ${item.days_overdue} days overdue`);
});
```

## Performance Considerations

1. **Caching**: Employee and location details are cached for 5 minutes to reduce external API calls
2. **Query Optimization**: Uses `select_related` to minimize database queries
3. **Indexing**: Ensure `return_date` and `asset_checkin` fields are properly indexed

## Testing

To test the report:

1. Create an asset checkout with a past return date
2. Do NOT check in the asset
3. Call the `/due-checkin-report/` endpoint
4. Verify the asset appears in the report with correct overdue days

## Future Enhancements

Potential improvements:
- Export to CSV/PDF functionality
- Email notifications for overdue items
- Filtering by location, employee, or date range
- Sorting options (by days overdue, asset name, etc.)
- Bulk check-in action from the report

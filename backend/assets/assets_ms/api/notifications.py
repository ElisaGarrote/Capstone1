"""
Notifications API endpoint.

Provides an endpoint to fetch all system notifications for:
- Low stock products
- Low stock components  
- Expired/expiring warranties
- Overdue asset returns
- Overdue audits
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from assets_ms.services.notifications import get_all_notifications


class NotificationsAPIView(APIView):
    """
    GET /notifications/
    
    Returns a list of all active notifications.
    Each notification includes:
    - id: unique identifier
    - type: notification type (low-stock, expiring, due-back, maintenance)
    - title: notification title
    - message: detailed message
    - item_type: type of related item (product, component, asset, audit_schedule, asset_checkout)
    - item_id: ID of the related item
    - item_name: name/identifier of the related item
    - created_at: timestamp
    """
    
    def get(self, request):
        try:
            notifications = get_all_notifications()
            return Response({
                'count': len(notifications),
                'results': notifications
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


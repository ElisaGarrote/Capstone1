from django.utils.deprecation import MiddlewareMixin
from assets_ms.models import ActivityLog
import json


class ActivityLogMiddleware(MiddlewareMixin):
    """Middleware that logs create/update/delete actions to ActivityLog.

    This middleware is intentionally simple: it logs POST/PUT/PATCH/DELETE
    requests made to API endpoints. It extracts a best-effort user id/name and
    item identifiers from the request and response.
    """

    LOG_METHODS = ("POST", "PUT", "PATCH", "DELETE")

    def process_response(self, request, response):
        try:
            method = request.method.upper()
            if method not in self.LOG_METHODS:
                return response

            # Best-effort: try to get user id and name from request (depends on auth setup)
            user_id = None
            user_name = None
            if hasattr(request, "user") and request.user and getattr(request.user, "id", None):
                user_id = getattr(request.user, "id")
                user_name = getattr(request.user, "username", None) or getattr(request.user, "email", None)

            # Fallback to headers if service forwards user info
            if not user_id:
                header_id = request.META.get("HTTP_X_USER_ID") or request.META.get("HTTP_X_UID")
                if header_id and header_id.isdigit():
                    user_id = int(header_id)

            # Map HTTP method to action
            action_map = {
                "POST": "CREATE",
                "PUT": "UPDATE",
                "PATCH": "UPDATE",
                "DELETE": "DELETE",
            }
            action = action_map.get(method, "UPDATE")

            # Determine module from path (simple heuristic)
            path = (request.path or "").lower()
            if "/assets" in path:
                activity_type = "Asset"
            elif "/components" in path:
                activity_type = "Component"
            elif "/audits" in path:
                activity_type = "Audit"
            elif "/repairs" in path:
                activity_type = "Repair"
            else:
                activity_type = "API"

            # Try to determine item id / identifier from response or url
            item_id = None
            item_identifier = None
            item_name = None
            try:
                # If response is JSON and contains 'id' or 'asset_id' or 'item_id'
                data = getattr(response, "data", None)
                if data and isinstance(data, dict):
                    item_id = data.get("id") or data.get("item_id") or data.get("asset") or data.get("asset_id")
                    # asset responses sometimes include asset_id string
                    item_identifier = data.get("asset_id") or data.get("item_identifier")
                    item_name = data.get("name") or data.get("item_name")
            except Exception:
                pass

            # fallback: try numeric path segment as id
            if not item_id:
                parts = [p for p in path.split("/") if p]
                if parts and parts[-1].isdigit():
                    item_id = int(parts[-1])

            # If we still don't have user_id, leave as 0 (system)
            if user_id is None:
                user_id = 0

            # Create the ActivityLog entry (ignore failures)
            try:
                ActivityLog.objects.create(
                    user_id=user_id,
                    user_name=user_name,
                    activity_type=activity_type,
                    action=action,
                    item_id=item_id,
                    item_identifier=item_identifier,
                    item_name=item_name,
                    notes=f"{method} {request.path}",
                )
            except Exception:
                pass

        except Exception:
            # Do not break response if logging fails
            pass

        return response

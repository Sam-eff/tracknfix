from rest_framework.permissions import BasePermission

from apps.accounts.models import Role


class IsAdmin(BasePermission):
    """Only shop admins (owners) can access."""
    message = "Only shop admins can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ADMIN)


class IsAdminOrStaff(BasePermission):
    """Admins and staff members can access — technicians cannot."""
    message = "Technicians do not have access to this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (Role.ADMIN, Role.STAFF)
        )

class IsAdminOrStaffWithInventoryPerms(BasePermission):
    """Admins have full access, staff only have access if shop allows it."""
    message = "You do not have permission to manage inventory."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.role == Role.ADMIN:
            return True
            
        if request.user.role == Role.STAFF:
            return request.user.shop and request.user.shop.allow_staff_inventory_management
            
        return False
        


class IsAdminOrTechnician(BasePermission):
    """Admins and technicians — useful for repair views."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (Role.ADMIN, Role.TECHNICIAN)
        )


class IsSameShop(BasePermission):
    """Object-level check: the object's shop matches the requesting user's shop."""
    message = "You do not have access to this resource."

    def has_object_permission(self, request, view, obj):
        shop = getattr(obj, "shop", None) or getattr(obj, "shop_id", None)
        return shop == request.user.shop or shop == request.user.shop_id


class IsProPlan(BasePermission):
    """Only shops with an active Pro plan can access this resource."""
    message = "This feature requires the Pro plan."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        shop = request.user.shop
        if not shop:
            return False

        return shop.has_pro_access

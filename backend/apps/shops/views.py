from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from utils.permissions import IsAdmin
from .models import Shop
from .serializers import ShopSerializer, ShopUpdateSerializer


class ShopDetailView(APIView):
    """
    GET  /api/v1/shops/   — returns this shop's full profile (all roles)
    PUT  /api/v1/shops/   — admin updates shop details
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # supports logo upload

    def get_permissions(self):
        if self.request.method == "PUT":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get(self, request):
        shop = request.user.shop
        return Response(ShopSerializer(shop).data)

    def put(self, request):
        shop = request.user.shop
        serializer = ShopUpdateSerializer(shop, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "message": "Shop updated successfully.",
            "shop": ShopSerializer(shop).data,
        })


class ShopStatsView(APIView):
    """
    GET /api/v1/shop/stats/
    Quick counts — useful for settings page or onboarding checklist.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        shop = request.user.shop

        from apps.accounts.models import CustomUser
        from apps.inventory.models import Product
        from apps.customers.models import Customer
        from apps.repairs.models import RepairTicket
        from apps.sales.models import Sale

        return Response({
            "total_staff": CustomUser.objects.filter(shop=shop).exclude(
                id=request.user.id
            ).count(),
            "total_products": Product.objects.filter(shop=shop, is_active=True).count(),
            "total_customers": Customer.objects.filter(shop=shop).count(),
            "total_sales": Sale.objects.filter(shop=shop).count(),
            "total_repairs": RepairTicket.objects.filter(shop=shop).count(),
            "trial_active": shop.is_in_trial,
            "subscription_active": shop.subscription_is_active,
        })
from django.db import transaction
from django.db.models import F
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from utils.mixins import ShopScopedMixin
from utils.permissions import IsAdmin, IsAdminOrStaff, IsAdminOrStaffWithInventoryPerms
from .models import Category, Product, StockLog
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    StockAdjustSerializer,
    StockLogSerializer,
)


class CategoryViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsAdminOrStaffWithInventoryPerms()]
        return [IsAuthenticated()]


class ProductViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = super().get_queryset().filter(is_active=True)
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        if category:
            qs = qs.filter(category_id=category)
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(brand__icontains=search) |
                Q(product_model__icontains=search)
            )
        return qs

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsAdminOrStaffWithInventoryPerms()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        shop = request.user.shop
        if not shop.can_add_product():
            plan = shop.effective_plan_for_limits
            limit = shop.product_limit
            return Response(
                {
                    "detail": (
                        f"Your {(plan.name if plan else 'current')} plan allows up to "
                        f"{limit} active product(s). Remove an old item or upgrade your plan to add more."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.is_active = False
        product.save()
        return Response({"message": "Product removed from inventory."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        """Products at or below their individual low_stock_threshold."""
        qs = self.get_queryset().filter(quantity__lte=F("low_stock_threshold"))
        serializer = self.get_serializer(qs, many=True)
        return Response({"count": qs.count(), "results": serializer.data})

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        from django.db.models import Sum
        qs = self.get_queryset()
        totals = qs.aggregate(
            total_value=Sum(F('quantity') * F('selling_price')),
            total_cost=Sum(F('quantity') * F('cost_price'))
        )
        return Response({
            "total_value": totals["total_value"] or 0,
            "total_cost": totals["total_cost"] or 0,
        })

    @action(
        detail=True, methods=["post"], url_path="adjust-stock",
        permission_classes=[IsAuthenticated, IsAdminOrStaffWithInventoryPerms],
    )
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        serializer = StockAdjustSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        change = serializer.validated_data["change_amount"]
        new_quantity = product.quantity + change

        if new_quantity < 0:
            return Response(
                {"error": f"Cannot reduce stock below zero. Current stock: {product.quantity}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            product.quantity = new_quantity
            product.save()
            StockLog.objects.create(
                product=product,
                change_amount=change,
                quantity_after=new_quantity,
                reason=serializer.validated_data["reason"],
                note=serializer.validated_data.get("note", ""),
                created_by=request.user,
            )

        return Response({
            "message": "Stock updated.",
            "product": product.name,
            "new_quantity": new_quantity,
        })

    @action(detail=True, methods=["get"], url_path="stock-history")
    def stock_history(self, request, pk=None):
        product = self.get_object()
        logs = StockLog.objects.filter(product=product).select_related("created_by")
        serializer = StockLogSerializer(logs, many=True)
        return Response(serializer.data)


class StockLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Global view of all stock movements for the shop."""
    serializer_class = StockLogSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    def get_queryset(self):
        return StockLog.objects.filter(
            product__shop=self.request.user.shop
        ).select_related("product", "created_by")

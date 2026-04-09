from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from utils.mixins import ShopScopedMixin
from utils.permissions import IsAdminOrStaff
from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrStaff]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get("search")
        phone = self.request.query_params.get("phone")
        if phone:
            qs = qs.filter(phone__icontains=phone)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(phone__icontains=search)
        return qs

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        customer = self.get_object()

        # Purchases
        from apps.sales.serializers import SaleSerializer
        purchases = customer.sales.prefetch_related("items__product").order_by("-created_at")

        # Repairs
        from apps.repairs.serializers import RepairTicketSerializer
        repairs = customer.repair_tickets.order_by("-created_at")

        return Response({
            "customer": CustomerSerializer(customer).data,
            "purchases": SaleSerializer(purchases, many=True).data,
            "repairs": RepairTicketSerializer(repairs, many=True).data,
        })

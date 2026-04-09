from rest_framework import viewsets, permissions
from utils.permissions import IsAdminOrStaff, IsSameShop, IsProPlan
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff, IsSameShop, IsProPlan]

    def get_queryset(self):
        user = self.request.user
        qs = Expense.objects.filter(shop=user.shop)
        
        # Optional date filtering
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
            
        return qs

    def perform_create(self, serializer):
        serializer.save(
            shop=self.request.user.shop,
            logged_by=self.request.user
        )

from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    logged_by_name = serializers.CharField(source="logged_by.get_full_name", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id", "amount", "category", "category_display", 
            "description", "date", "logged_by", "logged_by_name", 
            "created_at", "updated_at"
        ]
        read_only_fields = ["logged_by", "created_at", "updated_at"]

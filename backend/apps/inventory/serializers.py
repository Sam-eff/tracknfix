from rest_framework import serializers
from .models import Category, Product, StockLog


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(),
        required=False,
        allow_null=True,
    )
    category_name = serializers.SerializerMethodField()
    is_low_stock = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            "id", "name", "description", "sku",
            "category", "category_name",
            "cost_price", "selling_price", "profit_margin", "brand", "product_model", "color",
            "quantity", "low_stock_threshold", "is_low_stock",
            "image", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            self.fields["category"].queryset = Category.objects.filter(shop=request.user.shop)

    def validate(self, data):
        cost = data.get("cost_price", getattr(self.instance, "cost_price", None))
        selling = data.get("selling_price", getattr(self.instance, "selling_price", None))
        if cost and selling and selling < cost:
            raise serializers.ValidationError(
                {"selling_price": "Selling price cannot be lower than cost price."}
            )
        return data


class StockAdjustSerializer(serializers.Serializer):
    """Used for manual stock adjustments by admin/staff."""
    change_amount = serializers.IntegerField()
    reason = serializers.ChoiceField(choices=StockLog.Reason.choices)
    note = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_change_amount(self, value):
        if value == 0:
            raise serializers.ValidationError("Change amount cannot be zero.")
        return value


class StockLogSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    reason_display = serializers.SerializerMethodField()

    class Meta:
        model = StockLog
        fields = [
            "id", "product", "product_name", "change_amount",
            "quantity_after", "reason", "reason_display", "note",
            "created_by", "created_by_name", "created_at",
        ]

    def get_product_name(self, obj):
        return obj.product.name

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None

    def get_reason_display(self, obj):
        return obj.get_reason_display()

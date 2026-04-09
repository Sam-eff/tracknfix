from django.contrib import admin
from .models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ["product_name", "unit_price", "unit_cost", "quantity"]


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ["id", "shop", "customer", "staff", "total_amount", "total_profit", "created_at"]
    list_filter = ["shop"]
    search_fields = ["customer__name", "customer__phone"]
    readonly_fields = ["total_amount", "total_profit", "created_at"]
    inlines = [SaleItemInline]

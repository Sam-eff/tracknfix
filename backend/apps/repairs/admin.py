from django.contrib import admin
from .models import RepairTicket, RepairPart


class RepairPartInline(admin.TabularInline):
    model = RepairPart
    extra = 0
    readonly_fields = ["product_name", "unit_cost", "created_at"]


@admin.register(RepairTicket)
class RepairTicketAdmin(admin.ModelAdmin):
    list_display = [
        "id", "shop", "customer", "device_model",
        "status", "technician", "estimated_cost", "created_at"
    ]
    list_filter = ["shop", "status"]
    search_fields = ["customer__name", "device_model", "device_type"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [RepairPartInline]
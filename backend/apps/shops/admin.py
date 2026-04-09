from django.contrib import admin
from .models import Shop


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ["name", "owner_name", "email", "phone", "is_active", "subscription_expires_at", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "email", "owner_name"]
    readonly_fields = ["created_at", "updated_at"]

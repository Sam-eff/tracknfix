from django.db import models


class Category(models.Model):
    shop = models.ForeignKey("shops.Shop", on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("shop", "name")
        ordering = ["name"]
        indexes = [models.Index(fields=["shop"])]

    def __str__(self):
        return self.name


class Product(models.Model):
    shop = models.ForeignKey("shops.Shop", on_delete=models.CASCADE, related_name="products")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    brand = models.CharField(max_length=200, blank=True, null=True)
    product_model = models.CharField(max_length=200, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=200, blank=True, null=True)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    sku = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to="inventory/products/", null=True, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["shop"]),
            models.Index(fields=["shop", "category"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.shop.name})"

    @property
    def is_low_stock(self):
        return self.quantity <= self.low_stock_threshold

    @property
    def profit_margin(self):
        if self.selling_price == 0:
            return 0
        return round(((self.selling_price - self.cost_price) / self.selling_price) * 100, 2)


class StockLog(models.Model):
    """Audit trail — every stock change is recorded here."""

    class Reason(models.TextChoices):
        PURCHASE = "purchase", "Stock Purchase"
        SALE = "sale", "Sale"
        REPAIR = "repair", "Used in Repair"
        ADJUSTMENT = "adjustment", "Manual Adjustment"
        RETURN = "return", "Customer Return"
        DAMAGE = "damage", "Damaged / Written Off"

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stock_logs")
    change_amount = models.IntegerField()        # positive = added, negative = deducted
    quantity_after = models.PositiveIntegerField()  # snapshot of stock after change
    reason = models.CharField(max_length=20, choices=Reason.choices)
    note = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        "accounts.CustomUser", on_delete=models.SET_NULL, null=True, related_name="stock_logs"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["product", "-created_at"])]

    def __str__(self):
        direction = "+" if self.change_amount > 0 else ""
        return f"{self.product.name}: {direction}{self.change_amount} ({self.reason})"
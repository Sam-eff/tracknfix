from django.db import models
from django.utils import timezone


class Sale(models.Model):
    shop = models.ForeignKey("shops.Shop", on_delete=models.CASCADE, related_name="sales")
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="sales"
    )
    staff = models.ForeignKey(
        "accounts.CustomUser", on_delete=models.SET_NULL,
        null=True, related_name="sales"
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_credit = models.BooleanField(default=False)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def balance_owed(self):
        return max(self.total_amount - self.amount_paid, 0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["shop"]),
            models.Index(fields=["shop", "created_at"]),
        ]

    def __str__(self):
        return f"Sale #{self.id} — ₦{self.total_amount}"


class SalePayment(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    received_by = models.ForeignKey(
        "accounts.CustomUser",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sale_payments_received",
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["created_at", "id"]
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["sale", "created_at"]),
        ]

    def __str__(self):
        return f"Payment for Sale #{self.sale_id} — ₦{self.amount}"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "inventory.Product", on_delete=models.SET_NULL,
        null=True, related_name="sale_items"
    )
    product_name = models.CharField(max_length=200)  # snapshot at time of sale
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)   # selling price
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)    # cost at time of sale
    is_custom = models.BooleanField(default=False)    # marks ad-hoc items
    returned_quantity = models.PositiveIntegerField(default=0)

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    @property
    def profit(self):
        return (self.unit_price - self.unit_cost) * self.quantity

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"

from django.db import models

class Expense(models.Model):
    class Category(models.TextChoices):
        RENT = "rent", "Rent"
        SALARY = "salary", "Salary"
        UTILITIES = "utilities", "Utilities"
        SUPPLIES = "supplies", "Supplies"
        MAINTENANCE = "maintenance", "Maintenance"
        MARKETING = "marketing", "Marketing"
        MISCELLANEOUS = "miscellaneous", "Miscellaneous"

    shop = models.ForeignKey("shops.Shop", on_delete=models.CASCADE, related_name="expenses")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50, choices=Category.choices)
    description = models.TextField()
    date = models.DateField()
    logged_by = models.ForeignKey("accounts.CustomUser", on_delete=models.SET_NULL, null=True, related_name="logged_expenses")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["shop", "date"]),
        ]

    def __str__(self):
        return f"{self.get_category_display()} — ₦{self.amount} ({self.date})"

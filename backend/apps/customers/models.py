from django.db import models


class Customer(models.Model):
    shop = models.ForeignKey("shops.Shop", on_delete=models.CASCADE, related_name="customers")
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("shop", "phone")  # phone is unique per shop
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["shop"]),
            models.Index(fields=["shop", "phone"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.phone})"

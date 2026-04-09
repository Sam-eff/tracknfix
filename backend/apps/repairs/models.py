from django.db import models


class RepairTicket(models.Model):

    class Status(models.TextChoices):
        RECEIVED = "received", "Received"
        DIAGNOSING = "diagnosing", "Diagnosing"
        WAITING_PARTS = "waiting_parts", "Waiting for Parts"
        FIXED = "fixed", "Fixed"
        COLLECTED = "collected", "Collected"

    # Valid transitions — can jump to any forward status, but never go back
    # (except diagnosing ↔ waiting_parts which can toggle back and forth)
    ALLOWED_TRANSITIONS = {
        Status.RECEIVED:      [Status.DIAGNOSING, Status.WAITING_PARTS, Status.FIXED, Status.COLLECTED],
        Status.DIAGNOSING:    [Status.WAITING_PARTS, Status.FIXED, Status.COLLECTED],
        Status.WAITING_PARTS: [Status.DIAGNOSING, Status.FIXED, Status.COLLECTED],
        Status.FIXED:         [Status.COLLECTED],
        Status.COLLECTED:     [],  # terminal
    }

    shop = models.ForeignKey("shops.Shop", on_delete=models.CASCADE, related_name="repair_tickets")
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="repair_tickets"
    )
    technician = models.ForeignKey(
        "accounts.CustomUser", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="assigned_repairs"
    )

    # Device info
    device_type = models.CharField(max_length=100)   # e.g. Laptop, Phone, Tablet
    device_model = models.CharField(max_length=100)  # e.g. iPhone 13, HP Pavilion
    issue_description = models.TextField()

    # Financials
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    final_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RECEIVED)
    note = models.TextField(blank=True)  # internal technician notes
    image = models.ImageField(upload_to="repairs/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["shop"]),
            models.Index(fields=["shop", "status"]),
            models.Index(fields=["shop", "technician"]),
        ]

    def __str__(self):
        return f"Repair #{self.id} — {self.device_model} ({self.status})"

    def can_transition_to(self, new_status):
        return new_status in self.ALLOWED_TRANSITIONS.get(self.status, [])


class RepairPart(models.Model):
    """Spare parts used during a repair — auto-deducts from inventory."""
    ticket = models.ForeignKey(RepairTicket, on_delete=models.CASCADE, related_name="parts")
    product = models.ForeignKey(
        "inventory.Product", on_delete=models.SET_NULL,
        null=True, related_name="used_in_repairs"
    )
    product_name = models.CharField(max_length=200)  # snapshot
    quantity_used = models.PositiveIntegerField(default=1)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)  # snapshot

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product_name} x{self.quantity_used} (Repair #{self.ticket_id})"

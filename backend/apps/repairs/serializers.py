from rest_framework import serializers
from apps.accounts.models import Role
from apps.customers.models import Customer
from .models import RepairTicket, RepairPart


class RepairPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairPart
        fields = ["id", "product", "product_name", "quantity_used", "unit_cost", "created_at"]
        read_only_fields = ["id", "product_name", "unit_cost", "created_at"]


class RepairTicketSerializer(serializers.ModelSerializer):
    parts = RepairPartSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    technician_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = RepairTicket
        fields = [
            "id", "customer", "customer_name",
            "technician", "technician_name",
            "device_type", "device_model", "issue_description",
            "estimated_cost", "final_cost", "amount_paid",
            "status", "status_display", "note", "image",
            "parts", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "amount_paid", "created_at", "updated_at"]

    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer else None

    def get_technician_name(self, obj):
        return obj.technician.get_full_name() if obj.technician else "Unassigned"

    def get_status_display(self, obj):
        return obj.get_status_display()


class CreateRepairTicketSerializer(serializers.ModelSerializer):
    customer_phone = serializers.CharField(max_length=20, write_only=True)
    customer_name = serializers.CharField(max_length=200, write_only=True)

    class Meta:
        model = RepairTicket
        fields = [
            "customer_phone", "customer_name",
            "technician", "device_type", "device_model",
            "issue_description", "estimated_cost", "note", "image",
        ]

    def validate_customer_phone(self, value):
        import re
        if not re.match(r'^(\+\d{1,3}\s?)?\d{10,11}$', value):
            raise serializers.ValidationError(
                "Phone must be exactly 10 or 11 digits (with optional country code, e.g., +234)"
            )
        return value

    def validate_technician(self, user):
        if user is None:
            return None

        request = self.context.get("request")
        if request is None or not request.user.is_authenticated:
            raise serializers.ValidationError("Unable to validate technician for this request.")

        if user.shop_id != request.user.shop_id:
            raise serializers.ValidationError("Technician must belong to your shop.")

        if user.role != Role.TECHNICIAN:
            raise serializers.ValidationError("Assigned user must have the technician role.")

        return user


class UpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=RepairTicket.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, new_status):
        ticket = self.context["ticket"]
        if not ticket.can_transition_to(new_status):
            allowed = RepairTicket.ALLOWED_TRANSITIONS.get(ticket.status, [])
            allowed_labels = [RepairTicket.Status(s).label for s in allowed] if allowed else ["none"]
            raise serializers.ValidationError(
                f"Cannot move from '{ticket.get_status_display()}' to "
                f"'{RepairTicket.Status(new_status).label}'. "
                f"Allowed next steps: {', '.join(allowed_labels)}."
            )
        return new_status


class AddPartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CollectPaymentSerializer(serializers.Serializer):
    amount_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    final_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

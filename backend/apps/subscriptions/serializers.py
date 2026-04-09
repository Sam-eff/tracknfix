from rest_framework import serializers
from .models import Plan, Subscription, PaymentHistory


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            "id", "name", "description", "price",
            "interval", "features",
            "max_users", "max_products", "is_active",
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    pending_plan = PlanSerializer(read_only=True)
    days_remaining = serializers.SerializerMethodField()
    has_pending_checkout = serializers.ReadOnlyField()

    class Meta:
        model = Subscription
        fields = [
            "id", "plan", "status",
            "current_period_start", "current_period_end",
            "days_remaining", "created_at",
            "pending_plan", "pending_checkout_started_at", "has_pending_checkout",
        ]

    def get_days_remaining(self, obj):
        if not obj.current_period_end:
            return None
        from django.utils import timezone
        delta = obj.current_period_end - timezone.now()
        return max(0, delta.days)


class InitializePaymentSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()


class PaymentHistorySerializer(serializers.ModelSerializer):
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = PaymentHistory
        fields = ["id", "plan_name", "amount", "paystack_reference", "paid_at"]

    def get_plan_name(self, obj):
        return obj.plan.name if obj.plan else None

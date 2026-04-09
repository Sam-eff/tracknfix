from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Subscription


@receiver(post_delete, sender=Subscription)
def clear_shop_subscription_expiry_on_delete(sender, instance, **kwargs):
    shop = instance.shop
    if not shop:
        return

    if shop.subscription_expires_at is not None:
        shop.subscription_expires_at = None
        shop.save(update_fields=["subscription_expires_at"])

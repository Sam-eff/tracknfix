from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product


@receiver(post_save, sender=Product)
def check_low_stock(sender, instance, **kwargs):
    if instance.quantity <= instance.low_stock_threshold:
        # Import here to avoid circular imports
        from apps.notifications.tasks import notify_low_stock
        notify_low_stock.delay(instance.id)
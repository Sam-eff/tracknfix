"""
All notification message templates in one place.
Easy to update copy without touching task logic.
"""


def repair_ready_subject():
    return "Your device is ready for pickup!"


def repair_ready_body(customer_name, device_model, shop_name, shop_phone):
    return f"""Hi {customer_name},

Great news! Your {device_model} has been fixed and is ready for pickup.

Please visit us at your earliest convenience to collect your device.

If you have any questions, call us on {shop_phone}.

Thank you for choosing {shop_name}.
"""


def low_stock_subject(shop_name):
    return f"[{shop_name}] Low Stock Alert"


def low_stock_body(products, shop_name):
    product_lines = "\n".join(
        f"  - {p['name']}: {p['quantity']} remaining (threshold: {p['threshold']})"
        for p in products
    )
    return f"""Hi,

The following products in {shop_name} are running low:

{product_lines}

Please restock soon to avoid running out.

— TRACKNFIX Inventory Management
"""


def subscription_expiry_subject():
    return "Your TRACKNFIX Inventory Management subscription is expiring soon"


def subscription_expiry_body(shop_name, days_remaining, renewal_url=""):
    return f"""Hi,

Your TRACKNFIX Inventory Management subscription for {shop_name} will expire in {days_remaining} day(s).

To keep full access to your shop, please renew your subscription.
{f"Renew here: {renewal_url}" if renewal_url else ""}

If you have already renewed, please ignore this message.

— TRACKNFIX Inventory Management
"""
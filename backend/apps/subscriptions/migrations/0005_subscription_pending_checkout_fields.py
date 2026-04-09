from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("subscriptions", "0004_null_blank_paystack_plan_codes"),
    ]

    operations = [
        migrations.AddField(
            model_name="subscription",
            name="pending_checkout_reference",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="subscription",
            name="pending_checkout_started_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="subscription",
            name="pending_checkout_token",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="subscription",
            name="pending_plan",
            field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name="pending_shop_subscriptions", to="subscriptions.plan"),
        ),
    ]

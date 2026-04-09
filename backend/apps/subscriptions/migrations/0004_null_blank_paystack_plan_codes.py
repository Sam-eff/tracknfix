from django.db import migrations, models


def blank_codes_to_null(apps, schema_editor):
    Plan = apps.get_model("subscriptions", "Plan")
    Plan.objects.filter(paystack_plan_code="").update(paystack_plan_code=None)


class Migration(migrations.Migration):

    dependencies = [
        ("subscriptions", "0003_optional_paystack_plan_code"),
    ]

    operations = [
        migrations.RunPython(blank_codes_to_null, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="plan",
            name="paystack_plan_code",
            field=models.CharField(blank=True, default=None, max_length=100, null=True, unique=True),
        ),
    ]

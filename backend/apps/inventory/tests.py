from datetime import timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import CustomUser, Role
from apps.inventory.models import Product
from apps.shops.models import Shop
from apps.subscriptions.models import Plan, Subscription
from .models import Category


class InventorySecurityTests(APITestCase):
    def setUp(self):
        self.shop = Shop.objects.create(
            name="Shop A",
            owner_name="Owner A",
            email="a@example.com",
            phone="08012345678",
        )
        self.other_shop = Shop.objects.create(
            name="Shop B",
            owner_name="Owner B",
            email="b@example.com",
            phone="08087654321",
        )
        self.user = CustomUser.objects.create_user(
            email="admin@shopa.com",
            password="StrongPass123!",
            first_name="Admin",
            last_name="A",
            shop=self.shop,
            role=Role.ADMIN,
        )
        self.other_category = Category.objects.create(shop=self.other_shop, name="Foreign Category")

    def test_cannot_create_product_with_category_from_another_shop(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/v1/inventory/products/",
            {
                "name": "Phone Screen",
                "category": self.other_category.id,
                "cost_price": "1000.00",
                "selling_price": "1500.00",
                "quantity": 5,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Product.objects.filter(shop=self.shop).count(), 0)

    def test_basic_plan_enforces_product_limit(self):
        basic_plan = Plan.objects.create(
            name="Basic",
            description="Core operations",
            price="3000.00",
            paystack_plan_code="PLN_test_basic_product_limit",
            max_products=1,
        )
        from django.utils import timezone
        now = timezone.now()
        Shop.objects.filter(id=self.shop.id).update(
            created_at=now - timedelta(days=30),
            subscription_expires_at=now + timedelta(days=30),
        )
        Subscription.objects.create(
            shop=self.shop,
            plan=basic_plan,
            status=Subscription.Status.ACTIVE,
            current_period_start=now,
            current_period_end=now + timedelta(days=30),
        )
        Product.objects.create(
            shop=self.shop,
            name="Existing Product",
            cost_price="1000.00",
            selling_price="1500.00",
            quantity=1,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/v1/inventory/products/",
            {
                "name": "Second Product",
                "cost_price": "1000.00",
                "selling_price": "1500.00",
                "quantity": 5,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)

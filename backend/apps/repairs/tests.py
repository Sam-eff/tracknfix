from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import CustomUser, Role
from apps.shops.models import Shop
from .models import RepairTicket


class RepairSecurityTests(APITestCase):
    def setUp(self):
        self.shop = Shop.objects.create(
            name="Repair Hub",
            owner_name="Owner",
            email="repairs@example.com",
            phone="08012345678",
        )
        self.other_shop = Shop.objects.create(
            name="Other Shop",
            owner_name="Other Owner",
            email="other@example.com",
            phone="08087654321",
        )
        self.admin = CustomUser.objects.create_user(
            email="admin@repairhub.com",
            password="StrongPass123!",
            first_name="Admin",
            last_name="User",
            shop=self.shop,
            role=Role.ADMIN,
        )
        self.tech = CustomUser.objects.create_user(
            email="tech@repairhub.com",
            password="StrongPass123!",
            first_name="Tech",
            last_name="User",
            shop=self.shop,
            role=Role.TECHNICIAN,
        )
        self.foreign_tech = CustomUser.objects.create_user(
            email="tech@other.com",
            password="StrongPass123!",
            first_name="Other",
            last_name="Tech",
            shop=self.other_shop,
            role=Role.TECHNICIAN,
        )
        self.ticket = RepairTicket.objects.create(
            shop=self.shop,
            technician=self.tech,
            device_type="Phone",
            device_model="iPhone 13",
            issue_description="Broken screen",
        )

    def test_cannot_assign_repair_to_technician_from_another_shop(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            "/api/v1/repairs/",
            {
                "customer_phone": "08012345678",
                "customer_name": "John Doe",
                "technician": self.foreign_tech.id,
                "device_type": "Phone",
                "device_model": "Pixel 8",
                "issue_description": "Dead battery",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("details", response.data)
        self.assertIn("technician", response.data["details"])

    def test_generic_repair_patch_is_not_allowed(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            f"/api/v1/repairs/{self.ticket.id}/",
            {"note": "cross-tenant overwrite attempt"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

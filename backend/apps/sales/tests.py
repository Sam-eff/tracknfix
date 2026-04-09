from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import CustomUser, Role
from apps.customers.models import Customer
from apps.shops.models import Shop
from .models import Sale, SalePayment


class SalePaymentFlowTests(APITestCase):
    def setUp(self):
        self.shop = Shop.objects.create(
            name="Sales Shop",
            owner_name="Owner",
            email="sales@example.com",
            phone="08012345678",
        )
        self.user = CustomUser.objects.create_user(
            email="staff@sales.com",
            password="StrongPass123!",
            first_name="Sales",
            last_name="Staff",
            shop=self.shop,
            role=Role.STAFF,
        )
        self.customer = Customer.objects.create(
            shop=self.shop,
            name="Credit Buyer",
            phone="08077778888",
            email="buyer@example.com",
        )
        self.sale = Sale.objects.create(
            shop=self.shop,
            customer=self.customer,
            staff=self.user,
            total_amount="5000.00",
            total_profit="1500.00",
            amount_paid="1000.00",
            is_credit=True,
        )
        SalePayment.objects.create(
            sale=self.sale,
            amount="1000.00",
            note="Initial payment",
            received_by=self.user,
            created_at=self.sale.created_at,
        )
        self.client.force_authenticate(user=self.user)

    def test_record_payment_updates_sale_balance_and_creates_ledger_entry(self):
        response = self.client.post(
            f"/api/v1/sales/{self.sale.id}/record-payment/",
            {"amount": "1500.00", "note": "Customer paid more"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.sale.refresh_from_db()
        payment = self.sale.payments.order_by("-created_at", "-id").first()

        self.assertEqual(str(self.sale.amount_paid), "2500.00")
        self.assertEqual(self.sale.payments.count(), 2)
        self.assertEqual(str(payment.amount), "1500.00")
        self.assertEqual(payment.note, "Customer paid more")
        self.assertEqual(str(response.data["sale"]["balance_owed"]), "2500.00")

    def test_record_payment_rejects_overpayment(self):
        response = self.client.post(
            f"/api/v1/sales/{self.sale.id}/record-payment/",
            {"amount": "5000.00"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.sale.payments.count(), 1)
        self.assertIn("outstanding balance", response.data["error"])

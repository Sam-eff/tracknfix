from django.test import TestCase


class HealthcheckTests(TestCase):
    def test_healthcheck_returns_ok(self):
        response = self.client.get("/api/v1/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.json()["database"], "ok")

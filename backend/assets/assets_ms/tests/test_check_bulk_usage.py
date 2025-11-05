from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory
from assets_ms.views import check_bulk_usage
from rest_framework import status


class CheckBulkUsageTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_missing_type_returns_400(self):
        req = self.factory.post('/usage/check_bulk/', {}, format='json')
        resp = check_bulk_usage(req)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ids_not_list_returns_400(self):
        req = self.factory.post('/usage/check_bulk/', {'type': 'category', 'ids': 'notalist'}, format='json')
        resp = check_bulk_usage(req)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_too_many_ids_returns_413(self):
        big = list(range(0, 1000))
        req = self.factory.post('/usage/check_bulk/', {'type': 'category', 'ids': big}, format='json')
        resp = check_bulk_usage(req)
        self.assertEqual(resp.status_code, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

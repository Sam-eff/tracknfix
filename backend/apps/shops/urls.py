from django.urls import path
from .views import ShopDetailView, ShopStatsView

urlpatterns = [
    path("", ShopDetailView.as_view(), name="shop-detail"),
    path("stats/", ShopStatsView.as_view(), name="shop-stats"),
]
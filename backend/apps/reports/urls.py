from django.urls import path
from .views import (
    DashboardView,
    SalesReportView,
    BestSellingProductsView,
    TechnicianReportView,
    LowStockReportView,
    CreditCustomersReportView,
    ExportAnalyticsReportView,
    ExportShopBackupView,
    BackupImportPreviewView,
    BackupImportApplyView,
)



urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("sales/", SalesReportView.as_view(), name="sales-report"),
    path("products/best-selling/", BestSellingProductsView.as_view(), name="best-selling"),
    path("technicians/", TechnicianReportView.as_view(), name="technician-report"),
    path("inventory/low-stock/", LowStockReportView.as_view(), name="low-stock-report"),
    path("customers/credit/", CreditCustomersReportView.as_view(), name="credit-customers-report"),
    path("export/", ExportAnalyticsReportView.as_view(), name="export-analytics-report"),
    path("export/backup/", ExportShopBackupView.as_view(), name="export-shop-backup"),
    path("import/preview/", BackupImportPreviewView.as_view(), name="backup-import-preview"),
    path("import/apply/", BackupImportApplyView.as_view(), name="backup-import-apply"),
]

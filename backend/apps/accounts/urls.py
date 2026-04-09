from django.urls import path
from .views import (
    CsrfCookieView,
    CookieTokenRefreshView,
    LoginView,
    LogoutView,
    MeView,
    ShopRegisterView,
    ChangePasswordView,
    StaffListCreateView,
    StaffDetailView,
    ForgotPasswordView,
    ResetPasswordView,
    AdminResetStaffPasswordView,
)

urlpatterns = [
    path("csrf/", CsrfCookieView.as_view(), name="csrf-cookie"),
    path("register/", ShopRegisterView.as_view(), name="shop-register"),
    path("login/", LoginView.as_view(), name="token-obtain"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),

    # Password reset (email flow)
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),

    # Admin resets a staff member's password directly
    path("staff/<int:pk>/reset-password/", AdminResetStaffPasswordView.as_view(), name="staff-reset-password"),

    # Admin-only staff management
    path("staff/", StaffListCreateView.as_view(), name="staff-list-create"),
    path("staff/<int:pk>/", StaffDetailView.as_view(), name="staff-detail"),
]

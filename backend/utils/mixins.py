class ShopScopedMixin:
    """
    Mix into any APIView or ViewSet to automatically scope querysets to
    the requesting user's shop. All child views inherit this behaviour.

    Usage:
        class ProductViewSet(ShopScopedMixin, viewsets.ModelViewSet):
            queryset = Product.objects.all()  # base queryset
            ...
    """

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(shop=self.request.user.shop)

    def perform_create(self, serializer):
        """Auto-inject the shop on object creation."""
        serializer.save(shop=self.request.user.shop)

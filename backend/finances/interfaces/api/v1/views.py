from rest_framework import viewsets, permissions

from finances.application.use_cases import list_expenses_by_month
from .serializers import CategorySerializer, ExpenseSerializer


class ExpenseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        year_str = self.request.query_params.get('year')
        month_str = self.request.query_params.get('month')

        if not year_str or not month_str:
            return []

        try:
            year = int(year_str)
            month = int(month_str)
        except (ValueError, TypeError):
            return []
        
        queryset = list_expenses_by_month.execute(
            user=user,
            year=year,
            month=month
        )
        
        return queryset


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.categories.all().order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

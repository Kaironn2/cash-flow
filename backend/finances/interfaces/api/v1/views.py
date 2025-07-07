from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from . import serializers
from .mixins import BaseUserQuerysetMixin, MarkPaidActionMixin
from finances.services.installment_expense_service import InstallmentExpenseService
from finances.services.expense_list_service import ExpenseListService
from finances.services.expense_payment_service import ExpensePaymentService
from finances.models import Category, PaidRecurringExpense, InstallmentExpense, RecurringExpense
from finances.utils.validations import FinancesValidations


class ExpenseViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    viewsets.ReadOnlyModelViewSet,
    BaseUserQuerysetMixin,
    MarkPaidActionMixin
):
    serializer_class = serializers.ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    payment_service_class = ExpensePaymentService

    def _get_year_month(self):
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        return FinancesValidations.validate_month_year(year=year, month=month)

    def list(self, request, *args, **kwargs):
        year, month = self._get_year_month()
        all_expenses = ExpenseListService(request.user).all_for_month(year, month)

        page = self.paginate_queryset(all_expenses)
        serializer = self.get_serializer(page or all_expenses, many=True)
        return self.get_paginated_response(serializer.data) if page else Response(serializer.data)

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.ExpenseCreateSerializer
        return serializers.ExpenseSerializer

    @action(detail=False, methods=['get'], url_path='months')
    def get_months(self, request, *args, **kwargs):
        months = ExpenseListService(request.user).available_months()
        return Response(months)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)


class InstallmentExpenseViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    BaseUserQuerysetMixin,
):
    serializer_class = serializers.InstallmentExpenseCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = InstallmentExpense.objects.all()

    def perform_create(self, serializer):
        try:
            service = InstallmentExpenseService(
                user=self.request.user,
                **serializer.validated_data,
            )
            service.create_installment_expense()
        except ValueError as e:
            raise ValidationError(str(e))

    def perform_destroy(self, instance):
        instance.expenses.all().delete()
        instance.delete()


class RecurringExpenseViewSet(viewsets.ModelViewSet, BaseUserQuerysetMixin):
    serializer_class = serializers.RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = RecurringExpense.objects.all()

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        month = request.data.get('month')
        year = request.data.get('year')

        if not all([month, year]):
            return Response({'detail': 'Dados incompletos'}, status=status.HTTP_400_BAD_REQUEST)

        recurring = self.get_object()

        obj, created = PaidRecurringExpense.objects.get_or_create(
            user=request.user,
            recurring_expense=recurring,
            month=month,
            year=year,
        )

        serializer = serializers.PaidRecurringExpenseSerializer(obj)
        return Response(serializer.data, status=201 if created else 200)

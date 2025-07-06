from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from . import serializers
from finances.services import create_installment_expense
from finances.services.category_service import CategoryService
from finances.services.expense_list_service import ExpenseListService
from finances.services.expense_payment_service import ExpensePaymentService
from finances.models import PaidRecurringExpense, Expense, InstallmentExpense
from finances.utils.validations import FinancesValidations


class ExpenseViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    viewsets.ReadOnlyModelViewSet,
):
    serializer_class = serializers.ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.action == 'list':
            year, month = self._get_year_month()
            return ExpenseListService(self.request.user).for_month(year, month)
        return Expense.objects.filter(user=self.request.user)

    def _get_year_month(self):
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        return FinancesValidations.validate_month_year(year=year, month=month)

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.ExpenseCreateSerializer
        return serializers.ExpenseSerializer

    def perform_create(self, serializer):
        category_id = serializer.validated_data.pop('category_id', None)
        category = CategoryService(self.request.user, category_id).get_category_or_none()
        serializer.save(user=self.request.user, category=category)

    @action(detail=False, methods=['post'], url_path='mark-paid')
    def mark_paid(self, request, *args, **kwargs):
        try:
            service = ExpensePaymentService(
                user=request.user,
                items=request.data.get('ids', []),
                month=request.data.get('month'),
                year=request.data.get('year'),
            )
            service.mark()
            return Response({'status': 'marked as paid.'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='unmark-paid')
    def unmark_paid(self, request, *args, **kwargs):
        try:
            service = ExpensePaymentService(
                user=request.user,
                items=request.data.get('ids', []),
                month=request.data.get('month'),
                year=request.data.get('year'),
            )
            service.unmark()
            return Response({'status': 'unmarked as paid.'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='months')
    def get_months(self, request, *args, **kwargs):
        months = ExpenseListService(request.user).available_months()
        return Response(months)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.categories.all().order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InstallmentExpenseViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
):
    serializer_class = serializers.InstallmentExpenseCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = InstallmentExpense.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            create_installment_expense.execute(
                user=self.request.user, **serializer.validated_data
            )
        except ValueError as e:
            raise ValidationError(str(e))

    def perform_destroy(self, instance):
        instance.expenses.all().delete()
        instance.delete()


class RecurringExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.recurring_expenses.all().order_by('name')

    def perform_create(self, serializer):
        category_id = serializer.validated_data.pop('category_id', None)
        category = CategoryService(self.request.user, category_id).get_category_or_none()
        serializer.save(user=self.request.user, category=category)

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

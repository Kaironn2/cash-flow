from rest_framework import viewsets, permissions, mixins, serializers, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from finances.services import create_installment_expense
from finances.services.expense_list_service import ExpenseListService
from finances.services.expense_payment_service import ExpensePaymentService
from finances.models import Category, PaidRecurringExpense, Expense, InstallmentExpense
from .serializers import (
    CategorySerializer,
    ExpenseSerializer,
    ExpenseCreateSerializer,
    InstallmentExpenseCreateSerializer,
    RecurringExpenseSerializer,
    PaidRecurringExpenseSerializer,
)


class ExpenseViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    viewsets.ReadOnlyModelViewSet,
):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.action == 'list':
            year, month = self._get_year_month()
            return ExpenseListService(self.request.user).for_month(year, month)
        return Expense.objects.filter(user=self.request.user)

    def _get_year_month(self):
        year_str = self.request.query_params.get('year')
        month_str = self.request.query_params.get('month')

        if not year_str or not month_str:
            raise ValidationError({'error': 'Os campos mês e ano são obrigatórios.'})
        
        try:
            year = int(year_str)
            month = int(month_str)
        except (ValueError, TypeError):
            raise ValidationError({'error': 'Ano e mês devem ser números inteiros.'})
        
        return year, month

    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer

    def perform_create(self, serializer):
        category = None
        category_id = serializer.validated_data.pop('category_id', None)
        if category_id:
            try:
                category = Category.objects.get(id=category_id, user=self.request.user)
            except Category.DoesNotExist:
                raise serializers.ValidationError(
                    {'category_id': 'Category not found.'}
                )

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
    serializer_class = CategorySerializer
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
    serializer_class = InstallmentExpenseCreateSerializer
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
            raise serializers.ValidationError(str(e))

    def perform_destroy(self, instance):
        instance.expenses.all().delete()
        instance.delete()


class RecurringExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.recurring_expenses.all().order_by('name')

    def perform_create(self, serializer):
        category = None
        category_id = serializer.validated_data.pop('category_id', None)
        if category_id:
            try:
                category = Category.objects.get(id=category_id, user=self.request.user)
            except Category.DoesNotExist:
                raise serializers.ValidationError(
                    {'category_id': 'Category not found.'}
                )

        serializer.save(user=self.request.user, category=category)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        month = request.data.get('month')
        year = request.data.get('year')

        if not all([month, year]):
            return Response({'detail': 'Dados incompletos'}, status=400)

        recurring = self.get_object()

        obj, created = PaidRecurringExpense.objects.get_or_create(
            user=request.user,
            recurring_expense=recurring,
            month=month,
            year=year,
        )

        serializer = PaidRecurringExpenseSerializer(obj)
        return Response(serializer.data, status=201 if created else 200)

from rest_framework import viewsets, permissions, mixins, serializers
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from finances.application.use_cases import create_installment_expense, list_expenses_by_month
from finances.models import Category
from .serializers import (
    CategorySerializer,
    ExpenseSerializer,
    ExpenseCreateSerializer,
    InstallmentExpenseCreateSerializer,
    RecurringExpenseSerializer,
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
        user = self.request.user
        year_str = self.request.query_params.get('year')
        month_str = self.request.query_params.get('month')

        if not year_str or not month_str:
            raise ValidationError({
                'error': 'The "year" and "month" parameters are mandatory.'
            })

        try:
            year = int(year_str)
            month = int(month_str)
        except (ValueError, TypeError):
            raise ValidationError({
                'error': 'Os parâmetros "year" e "month" devem ser números inteiros.'
            })
        
        queryset = list_expenses_by_month.execute(
            user=user,
            year=year,
            month=month
        )
        
        return queryset

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

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        expense = self.get_object()
        
        if not expense.paid:
            expense.paid = True
            expense.save(update_fields=['paid'])

        return Response(self.get_serializer(expense).data)


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

    def perform_create(self, serializer):
        try:
            create_installment_expense.execute(
                user=self.request.user, 
                **serializer.validated_data
            )
        except ValueError as e:
            raise serializers.ValidationError(str(e))


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
                raise serializers.ValidationError({'category_id': 'Category not found.'})
        
        serializer.save(user=self.request.user, category=category)

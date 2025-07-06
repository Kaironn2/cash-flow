from rest_framework import serializers

from finances.models import (
    Category,
    Expense,
    InstallmentExpense,
    PaidRecurringExpense,
    RecurringExpense
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ExpenseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    installment_origin = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'name',
            'amount',
            'due_date',
            'paid',
            'category',
            'installment_origin',
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.id and instance.id < 0:
            ret['id'] = abs(instance.id)
            ret['is_recurring'] = True
        else:
            ret['is_recurring'] = False

        ret['is_installment'] = instance.installment_origin_id is not None

        return ret


class InstallmentExpenseCreateSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = InstallmentExpense
        fields = [
            'name',
            'total_amount',
            'installments_quantity',
            'first_due_date',
            'category_id',
        ]


class ExpenseCreateSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Expense
        fields = [
            'name',
            'amount',
            'due_date',
            'paid',
            'category_id',
        ]


class RecurringExpenseSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = RecurringExpense
        fields = [
            'id',
            'name',
            'amount',
            'due_day',
            'start_date',
            'end_date',
            'active',
            'category_id',
        ]
        read_only_fields = ['id', 'active']


class PaidRecurringExpenseSerializer(serializers.ModelSerializer):
    date = serializers.DateField(write_only=True)

    class Meta:
        model = PaidRecurringExpense
        fields = [
            'id',
            'recurring_expense',
            'date',
            'day',
            'month',
            'year',
            'created_at',
        ]
        read_only_fields = ['day', 'month', 'year', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        recurring_expense = validated_data['recurring_expense']
        date = validated_data['date']

        obj, created = PaidRecurringExpense.objects.get_or_create(
            user=user,
            recurring_expense=recurring_expense,
            month=date.month,
            year=date.year,
            defaults={'day': date.day}
        )
        return obj

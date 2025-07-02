from rest_framework import serializers

from finances.models import Expense, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ExpenseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id',
            'name',
            'amount',
            'due_date',
            'paid',
            'category',
            'is_installment',
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

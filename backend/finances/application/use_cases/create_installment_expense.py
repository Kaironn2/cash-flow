import datetime
from decimal import Decimal

from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import User

from finances.models import InstallmentExpense, Expense, Category


def execute(
    user: User,
    name: str,
    total_amount: Decimal,
    installments_quantity: int,
    first_due_date: datetime.date,
    category_id: int
) -> InstallmentExpense:
    try:
        category = Category.objects.get(id=category_id, user=user)
    except Category.DoesNotExist:
        raise ValueError('Category not found.')

    installment_expense = InstallmentExpense.objects.create(
        user=user,
        name=name,
        total_amount=total_amount,
        installments_quantity=installments_quantity,
        first_due_date=first_due_date,
        category=category
    )

    installment_amount = round(total_amount / installments_quantity, 2)
    
    for i in range(installments_quantity):
        due_date = first_due_date + relativedelta(months=i)
        expense_name = f'{name} ({i+1}/{installments_quantity})'
        
        Expense.objects.create(
            user=user,
            name=expense_name,
            amount=installment_amount,
            due_date=due_date,
            category=category,
            installment_origin=installment_expense
        )
        
    return installment_expense
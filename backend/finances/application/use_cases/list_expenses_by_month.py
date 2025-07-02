import datetime
from django.db.models import Q
from django.contrib.auth.models import User
from finances.models import Expense, RecurringExpense

def execute(user: User, year: int, month: int):
    concrete_expenses = list(Expense.objects.filter(
        user=user,
        due_date__year=year,
        due_date__month=month
    ))

    first_day_of_month = datetime.date(year, month, 1)

    recurring_rules = RecurringExpense.objects.filter(
        user=user,
        active=True,
        start_date__lte=first_day_of_month,
    ).filter(
        Q(end_date__gte=first_day_of_month) | Q(end_date__isnull=True)
    )

    virtual_expenses = []
    for rule in recurring_rules:
        try:
            due_date_for_month = datetime.date(year, month, rule.due_day)
        except ValueError:
            continue
        
        virtual_expense = Expense(
            id=rule.id * -1, 
            user=user,
            name=rule.name,
            amount=rule.amount,
            due_date=due_date_for_month,
            category=rule.category,
            paid=False
        )
        virtual_expenses.append(virtual_expense)

    all_expenses = sorted(
        concrete_expenses + virtual_expenses, 
        key=lambda expense: expense.due_date
    )
    
    return all_expenses

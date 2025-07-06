import datetime
from typing import List, Dict
from django.db.models import Q
from django.db.models.functions import ExtractMonth, ExtractYear
from django.contrib.auth.models import User

from finances.models import Expense, RecurringExpense, PaidRecurringExpense


class ExpenseListService:
    def __init__(self, user: User):
        self.user = user

    def for_month(self, year: int, month: int) -> List[Expense]:
        concrete = list(Expense.objects.filter(
            user=self.user,
            due_date__year=year,
            due_date__month=month
        ))

        first_day = datetime.date(year, month, 1)

        recurring_rules = RecurringExpense.objects.filter(
            user=self.user,
            active=True,
            start_date__lte=first_day,
        ).filter(
            Q(end_date__gte=first_day) | Q(end_date__isnull=True)
        )

        paid_map = {
            (p.recurring_expense_id, p.month, p.year): True
            for p in PaidRecurringExpense.objects.filter(
                user=self.user,
                month=month,
                year=year
            )
        }

        virtual_expenses = []
        for rule in recurring_rules:
            try:
                due_date = datetime.date(year, month, rule.due_day)
            except ValueError:
                continue

            is_paid = paid_map.get((rule.id, month, year), False)

            virtual_expense = Expense(
                id=rule.id * -1,
                user=self.user,
                name=rule.name,
                amount=rule.amount,
                due_date=due_date,
                category=rule.category,
                paid=is_paid,
            )
            virtual_expenses.append(virtual_expense)

        return sorted(concrete + virtual_expenses, key=lambda e: e.due_date)

    def available_months(self) -> List[Dict[str, int]]:
        concrete = (
            Expense.objects.filter(user=self.user)
            .annotate(m=ExtractMonth('due_date'), y=ExtractYear('due_date'))
            .values('m', 'y')
        )

        recurring = recurring = PaidRecurringExpense.objects.filter(user=self.user).values('month', 'year')

        combined = {(c['m'], c['y']) for c in concrete} | {
            (r['month'], r['year']) for r in recurring
        }

        return [{'month': m, 'year': y} for m, y in sorted(combined, key=lambda x: (x[1], x[0]), reverse=True)]

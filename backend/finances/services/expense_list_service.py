import calendar
import datetime
from typing import List, Dict
from django.db.models import Q
from django.db.models.functions import ExtractMonth, ExtractYear
from django.contrib.auth.models import User

from finances.models import Expense, RecurringExpense, PaidRecurringExpense
from finances.utils.validations import FinancesValidations


class ExpenseListService:
    def __init__(self, user: User):
        self.user = user

    def for_month(self, year: int, month: int) -> List[Expense]:
        FinancesValidations.validate_month_year(year, month)
        concrete = list(
            Expense.objects.filter(
                user=self.user, due_date__year=year, due_date__month=month
            )
        )
        rules = self._get_recurring_rules(year, month)
        paid_map = self._get_paid_map(year, month)
        virtual = self._generate_virtual_expenses(rules, paid_map, year, month)
        return sorted(concrete + virtual, key=lambda e: e.due_date)

    def all_for_month(self, year: int, month: int) -> List[Expense]:
        concrete = list(
            Expense.objects.filter(
                user=self.user,
                due_date__year=year,
                due_date__month=month,
            )
        )
        virtual = self.get_virtual_expenses(year, month)
        return sorted(concrete + virtual, key=lambda e: e.due_date)

    def available_months(self) -> List[Dict[str, int]]:
        concrete = (
            Expense.objects.filter(user=self.user)
            .annotate(m=ExtractMonth('due_date'), y=ExtractYear('due_date'))
            .values('m', 'y')
        )

        recurring = recurring = PaidRecurringExpense.objects.filter(
            user=self.user
        ).values('month', 'year')

        combined = {(c['m'], c['y']) for c in concrete} | {
            (r['month'], r['year']) for r in recurring
        }

        return [
            {'month': m, 'year': y}
            for m, y in sorted(combined, key=lambda x: (x[1], x[0]), reverse=True)
        ]

    def get_virtual_expenses(self, year: int, month: int) -> List[Expense]:
        FinancesValidations.validate_month_year(year, month)
        rules = self._get_recurring_rules(year, month)
        paid_map = self._get_paid_map(year, month)
        return self._generate_virtual_expenses(rules, paid_map, year, month)

    def _get_recurring_rules(self, year: int, month: int):
        first_day = datetime.date(year, month, 1)
        last_day = datetime.date(year, month, calendar.monthrange(year, month)[1])
        return RecurringExpense.objects.filter(
            user=self.user,
            active=True,
            start_date__lte=last_day,
        ).filter(Q(end_date__gte=first_day) | Q(end_date__isnull=True))

    def _get_paid_map(self, year: int, month: int):
        return {
            (p.recurring_expense_id, p.month, p.year): True
            for p in PaidRecurringExpense.objects.filter(
                user=self.user, month=month, year=year
            )
        }

    def _generate_virtual_expenses(self, rules, paid_map, year, month):
        virtual_expenses = []
        for rule in rules:
            due_date = FinancesValidations.safe_due_date(year, month, rule.due_day)
            is_paid = paid_map.get((rule.id, month, year), False)
            virtual_expenses.append(
                Expense(
                    id=rule.id * -1,
                    user=self.user,
                    name=rule.name,
                    amount=rule.amount,
                    due_date=due_date,
                    category=rule.category,
                    paid=is_paid,
                )
            )
        return virtual_expenses

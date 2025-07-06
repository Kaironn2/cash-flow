from finances.models import Expense, PaidRecurringExpense


class ExpensePaymentService:
    def __init__(self, user, items, month=None, year=None):
        self.user = user
        self.items = items
        self.month = month
        self.year = year
        self.concrete_ids = []
        self.recurring_payloads = []

        self._validate_and_extract()

    def _validate_and_extract(self):
        for item in self.items:
            if not isinstance(item, dict):
                raise ValueError('Formato de dados inválido')

            typ = item.get('type')
            raw_id = item.get('id')

            if typ in ['e', 'i']:
                self.concrete_ids.append(raw_id)
            elif typ == 'r':
                if not self.month or not self.year:
                    raise ValueError('Mês e ano são obrigatórios para recorrentes')
                self.recurring_payloads.append({
                    'recurring_expense_id': raw_id,
                    'month': self.month,
                    'year': self.year
                })

    def mark(self):
        if self.concrete_ids:
            Expense.objects.filter(user=self.user, id__in=self.concrete_ids).update(paid=True)

        for payload in self.recurring_payloads:
            PaidRecurringExpense.objects.get_or_create(
                user=self.user,
                recurring_expense_id=payload['recurring_expense_id'],
                month=payload['month'],
                year=payload['year'],
                defaults={'day': 1},
            )

    def unmark(self):
        if self.concrete_ids:
            Expense.objects.filter(user=self.user, id__in=self.concrete_ids).update(paid=False)

        for payload in self.recurring_payloads:
            PaidRecurringExpense.objects.filter(
                user=self.user,
                recurring_expense_id=payload['recurring_expense_id'],
                month=payload['month'],
                year=payload['year'],
            ).delete()

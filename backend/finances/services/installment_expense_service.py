import datetime
from decimal import Decimal

from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import User

from finances.models import InstallmentExpense, Expense, Category


class InstallmentExpenseService:
    def __init__(
        self,
        user: User,
        name: str,
        total_amount: Decimal,
        installments_quantity: int,
        first_due_date: datetime.date,
        category_id: int
    ):
        self.user = user
        self.name = name
        self.total_amount = total_amount
        self.installments_quantity = installments_quantity
        self.first_due_date = first_due_date
        self.category_id = category_id

    def create_installment_expense(self) -> InstallmentExpense:
        category = self._get_category()

        installment_expense = InstallmentExpense.objects.create(
            user=self.user,
            name=self.name,
            total_amount=self.total_amount,
            installments_quantity=self.installments_quantity,
            first_due_date=self.first_due_date,
            category=category
        )

        self._create_expenses(installment_expense, category)

        return installment_expense

    def _get_category(self) -> Category:
        try:
            return Category.objects.get(id=self.category_id, user=self.user)
        except Category.DoesNotExist:
            raise ValueError('Categoria não encontrada.')

    def _create_expenses(self, installment_expense: InstallmentExpense, category: Category):
        installment_amount = round(self.total_amount / self.installments_quantity, 2)

        for i in range(self.installments_quantity):
            due_date = self.first_due_date + relativedelta(months=i)
            expense_name = f'{self.name} ({i+1}/{self.installments_quantity})'

            Expense.objects.create(
                user=self.user,
                name=expense_name,
                amount=installment_amount,
                due_date=due_date,
                category=category,
                installment_origin=installment_expense
            )

from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['name']
        unique_together = [['user', 'name']]

    def __str__(self):
        return self.name


class RecurringExpense(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='recurring_expenses'
    )
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_day = models.PositiveIntegerField()
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='recurring_expenses'
    )
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Despesa Recorrente'
        verbose_name_plural = 'Despesas Recorrentes'
        ordering = ['name']

    def __str__(self):
        return self.name


class PaidRecurringExpense(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='paid_recurring_expenses'
    )
    recurring_expense = models.ForeignKey(
        RecurringExpense,
        on_delete=models.CASCADE,
        related_name='paid_recurring_expenses',
    )
    day = models.PositiveIntegerField()
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['recurring_expense', 'month', 'year']]
        verbose_name = 'Pagamento de Despesa Recorrente'
        verbose_name_plural = 'Pagamentos de Despesas Recorrentes'

    def __str__(self):
        return f'{self.recurring_expense.name} {self.date.strftime('%m-%Y')}'


class InstallmentExpense(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='installments'
    )
    name = models.CharField(max_length=255)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    installments_quantity = models.PositiveIntegerField()
    first_due_date = models.DateField()
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='installments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Despesa Parcelada'
        verbose_name_plural = 'Despesas Parceladas'
        ordering = ['name']

    def __str__(self):
        return self.name


class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name='expenses',
        blank=True,
        null=True,
    )
    paid = models.BooleanField(default=False)
    installment_origin = models.ForeignKey(
        InstallmentExpense,
        on_delete=models.CASCADE,
        related_name='expenses',
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Despesa'
        verbose_name_plural = 'Despesas'
        ordering = ['due_date']

    def __str__(self):
        return self.name

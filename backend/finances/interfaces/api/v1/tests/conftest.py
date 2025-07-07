from datetime import date

import pytest
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient

from finances.models import Category, Expense

@pytest.fixture
def user(db):
    return User.objects.create_user(username='jonh', email='jonh@test.com', password='12345678')

@pytest.fixture
def auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
    return client

@pytest.fixture
def expenses_url():
    return '/api/v1/finances/expenses/'

@pytest.fixture
def categories_url():
    return '/api/v1/finances/categories/'

@pytest.fixture
def recurring_expenses_url():
    return '/api/v1/finances/recurring-expenses/'

@pytest.fixture
def installment_expenses_url():
    return '/api/v1/finances/installment-expenses/'

@pytest.fixture
def create_category(user):
    def _create_category(name='Categoria Padrão', owner=user):
        return Category.objects.create(name=name, user=owner)
    return _create_category

@pytest.fixture
def create_expense(user, create_category):
    def _create_expense(
        name='Despesa padrão',
        amount=100,
        due_date=date(2025, 7, 5),
        paid=False,
        category_obj=None,
        owner=user
    ):
        
        if category_obj is None:
            category_obj = create_category()

        return Expense.objects.create(
            user=owner,
            name=name,
            amount=amount,
            due_date=due_date,
            paid=paid,
            category=category_obj
        )
    return _create_expense

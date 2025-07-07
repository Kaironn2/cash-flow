from datetime import date
from http import HTTPStatus

import pytest

from finances.models import Expense


@pytest.mark.django_db
def test_list_expenses_requires_authentication(client, expenses_url):
    response = client.get(expenses_url)
    assert response.status_code == HTTPStatus.UNAUTHORIZED


@pytest.mark.django_db
def test_list_expenses_by_month(auth_client, expenses_url, create_expense, create_category):
    category = create_category(name='Moradia')
    create_expense(name='Internet', amount=120, due_date=date(2025, 7, 10), category_obj=category)
    create_expense(name='Luz', amount=80, due_date=date(2025, 6, 15), category_obj=category)
    create_expense(name='Aluguel', amount=600, due_date=date(2025, 6, 20), category_obj=category)

    response1 = auth_client.get(f'{expenses_url}?year=2025&month=7')
    response2 = auth_client.get(f'{expenses_url}?year=2025&month=6')

    assert response1.status_code == HTTPStatus.OK
    assert len(response1.data) == 1
    assert response1.data[0]['name'] == 'Internet'
    assert float(response1.data[0]['amount']) == 120.00

    assert response2.status_code == HTTPStatus.OK
    assert len(response2.data) == 2
    assert response2.data[1]['name'] == 'Aluguel'
    assert float(response2.data[1]['amount']) == 600.00


@pytest.mark.django_db
def test_expense_not_found(auth_client, expenses_url):
    response = auth_client.get(f'{expenses_url}1/')
    assert response.status_code == HTTPStatus.NOT_FOUND


@pytest.mark.django_db
def test_create_expense(auth_client, expenses_url, create_category):
    category = create_category(name='Moradia')
    category_id = category.id

    payload = {
        'name': 'Ifood',
        'amount': 25,
        'due_date': '2025-07-16',
        'paid': False,
        'category_id': category_id
    }
    response = auth_client.post(f'{expenses_url}', payload, format='json')
    assert response.status_code == HTTPStatus.CREATED
    assert Expense.objects.filter(name='Ifood').exists()


@pytest.mark.django_db
def test_delete_expense(auth_client, expenses_url, create_category, create_expense):
    category = create_category(name='Moradia')
    expense = create_expense(name='Luz', amount=120, due_date=date(2025, 7, 10), category_obj=category)

    assert Expense.objects.filter(id=expense.id).exists()

    response = auth_client.delete(f'{expenses_url}1/', format='json')

    assert response.status_code == HTTPStatus.NO_CONTENT
    assert not Expense.objects.filter(id=expense.id).exists()


@pytest.mark.django_db
def test_update_expense(auth_client, expenses_url, create_category, create_expense):
    category = create_category(name='Moradia')
    expense = create_expense(name='Luz', amount=120, due_date=date(2025, 7, 10), category_obj=category)

    new_name = 'Luz Atualizada'
    new_amount = 160

    payload = {
        'name': new_name, 
        'amount': new_amount,
        'due_date': date(2025, 8, 10),
        'category_id': category.id
    }
    response = auth_client.put(f'{expenses_url}{expense.id}/', payload, format='json')

    assert response.status_code == HTTPStatus.OK
    assert response.data['name'] == new_name
    assert float(response.data['amount']) == 160.00

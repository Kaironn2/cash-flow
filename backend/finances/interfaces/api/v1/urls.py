from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ExpenseViewSet,
    InstallmentExpenseViewSet,
    RecurringExpenseViewSet,
)

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'installment-expenses', InstallmentExpenseViewSet, basename='installment-expense')
router.register(r'recurring-expenses', RecurringExpenseViewSet, basename='recurring-expense')

urlpatterns = [
    path('', include(router.urls)),
]

import calendar
import datetime

from rest_framework.exceptions import ValidationError


class FinancesValidations:

    @staticmethod
    def validate_month_year(year, month):
        if month is None or year is None:
            raise ValidationError({'error': 'Os campos mês e ano são obrigatórios.'})

        try:
            month = int(month)
            year = int(year)
        except (ValueError, TypeError):
            raise ValidationError({'error': 'Ano e mês devem ser números inteiros.'})

        if not (1 <= month <= 12):
            raise ValidationError({'error': 'Mês deve estar entre 1 e 12.'})

        return year, month

    @staticmethod
    def safe_due_date(year: int, month: int, day: int) -> datetime.date:
        last_day = calendar.monthrange(year, month)[1]
        return datetime.date(year, month, min(day, last_day))

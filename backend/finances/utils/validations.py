from rest_framework.exceptions import ValidationError


class FinancesValidations:
    
    @staticmethod
    def validate_month_year(month, year):
        if month is None or year is None:
            raise ValidationError({'error': 'Os campos mês e ano são obrigatórios.'})

        try:
            month = int(month)
            year = int(year)
        except (ValueError, TypeError):
            raise ValidationError({'error': 'Ano e mês devem ser números inteiros.'})

        if not (1 <= month <= 12):
            raise ValidationError({'error': 'Mês deve estar entre 1 e 12.'})

        return month, year

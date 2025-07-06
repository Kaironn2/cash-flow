from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class BaseUserQuerysetMixin:
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)


class MarkPaidActionMixin:
    def _toggle_payment(self, request, mark=True):
        try:
            service = self.payment_service_class(
                user=request.user,
                items=request.data.get('ids', []),
                month=request.data.get('month'),
                year=request.data.get('year'),
            )
            service.mark() if mark else service.unmark()
            return Response({'status': 'marked' if mark else 'unmarked'})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='mark-paid')
    def mark_paid(self, request, *args, **kwargs):
        return self._toggle_payment(request, mark=True)

    @action(detail=False, methods=['post'], url_path='unmark-paid')
    def unmark_paid(self, request, *args, **kwargs):
        return self._toggle_payment(request, mark=False)

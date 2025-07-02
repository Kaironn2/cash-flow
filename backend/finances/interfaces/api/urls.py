from django.urls import path, include

urlpatterns = [
    path('', include('finances.interfaces.api.v1.urls')),
]

from django.urls import path, include

from .v1 import urls as v1_urls

VERSION_MAP = {
    'v1': v1_urls,
}

def versioned_urls(request, **kwargs):
    version = kwargs.get('version')
    
    urls_to_include = VERSION_MAP.get(version, v1_urls)
    
    return urls_to_include.urlpatterns

urlpatterns = [
    path('', include(versioned_urls)),
]

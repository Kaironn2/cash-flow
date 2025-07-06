from finances.models import Category
from rest_framework import serializers


class CategoryService:
    def __init__(self, user, category_id):
        self.user = user
        self.category_id = category_id

    def get_category_or_none(self):
        if self.category_id is None:
            return None
        try:
            return Category.objects.get(id=self.category_id, user=self.user)
        except Category.DoesNotExist:
            raise serializers.ValidationError({'category_id': 'Category not found.'})

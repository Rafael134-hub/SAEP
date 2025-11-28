import django_filters
from django.db import models
from .models import Produto

class ProdutoFilter(django_filters.FilterSet):
    busca = django_filters.CharFilter(method='filter_busca')

    class Meta:
        model = Produto
        fields = ['busca'] 

    def filter_busca(self, queryset, name, value):
        return queryset.filter(
            models.Q(nome_produto__icontains=value) | 
            models.Q(descricao_produto__icontains=value)
        )
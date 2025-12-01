# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProdutoViewSet, MovimentacaoViewSet, UserInfoView

router = DefaultRouter()
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'movimentacoes', MovimentacaoViewSet, basename='movimentacao')

urlpatterns = [
    # Inclui as rotas geradas pelo router (produtos/, movimentacoes/)
    path('', include(router.urls)), 
    
    # Rota de informação do usuário (Entrega 5.1.1)
    path('user/info/', UserInfoView.as_view(), name='user_info'),
]
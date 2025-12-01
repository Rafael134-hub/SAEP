# api/views.py

from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import F
from .models import Produto, Movimentacao
from .serializers import ProdutoSerializer, MovimentacaoSerializer, SaidaMovimentacaoSerializer, UserSerializer
# Importe o UserSerializer e o serializers (se não estiverem lá, para o ValidationError)

class ProdutoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProdutoSerializer
    # filterset_class = ProdutoFilter # Removido se django_filters não estiver instalado
    
    def get_queryset(self):
        # Entrega 7.1.1: Produtos ordenados alfabeticamente
        return Produto.objects.all().order_by(F('nome_produto')) 

class MovimentacaoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Movimentações ordenadas por data (mais recente primeiro)
        return Movimentacao.objects.all().select_related('produto_id', 'usuario').order_by('-data_movimentacao')

    def get_serializer_class(self):
        if self.action == 'create' and self.request.data.get('categoria_movimentacao') == 'SAIDA':
            return SaidaMovimentacaoSerializer 
        return MovimentacaoSerializer

    def perform_create(self, serializer):
        produto_id = serializer.validated_data.get('produto_id')
        categoria_movimentacao = serializer.validated_data.get('categoria_movimentacao')
        quantidade = serializer.validated_data.get('quantidade_movimentacao')
        
        # Lógica de validação de estoque para SAÍDA
        if categoria_movimentacao == 'SAIDA':
            produto = produto_id
            if quantidade > produto.estoque_atual_produto:
                # Retorna um erro específico para o frontend (Entrega 7.1.2)
                raise serializers.ValidationError({"quantidade_movimentacao": "A quantidade de saída é maior que o estoque atual."})
        
        # Salva a movimentação associando o usuário logado (Entrega 7.1.3)
        serializer.save(usuario=self.request.user)

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retorna os dados do usuário logado (Entrega 5.1.1)
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
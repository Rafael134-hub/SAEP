from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import F
from .models import Produto, Movimentacao
from .serializers import ProdutoSerializer, MovimentacaoSerializer, SaidaMovimentacaoSerializer
from .filters import ProdutoFilter

class ProdutoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProdutoSerializer
    filterset_class = ProdutoFilter
    
    def get_queryset(self):
        return Produto.objects.all().order_by(F('nome_produto')) 

class MovimentacaoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Movimentacao.objects.all().select_related('produto_id', 'usuario').order_by('-data_movimentacao')

    def get_serializer_class(self):
        if self.action == 'create' and self.request.data.get('categoria_movimentacao') == 'SAIDA':
            return SaidaMovimentacaoSerializer 
        return MovimentacaoSerializer

    def perform_create(self, serializer):
        produto_id = serializer.validated_data.get('produto_id')
        categoria_movimentacao = serializer.validated_data.get('categoria_movimentacao')
        quantidade = serializer.validated_data.get('quantidade_movimentacao')
        
        if categoria_movimentacao == 'SAIDA':
            produto = produto_id
            if quantidade > produto.estoque_atual_produto:
                raise serializers.ValidationError({"quantidade_movimentacao": "A quantidade de saída é maior que o estoque atual."})
        serializer.save(usuario=self.request.user)

from rest_framework.views import APIView
from .serializers import UserSerializer
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
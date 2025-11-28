from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Produto, Movimentacao

# Serializer para o nome do usuário responsável na movimentação
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

# Serializer para CRUD de Produto (Entrega 6)
class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'

# Serializer para CRUD de Movimentação
# ... (código anterior) ...

class MovimentacaoSerializer(serializers.ModelSerializer):
    # Campos customizados para facilitar o frontend
    produto_nome = serializers.CharField(source='produto.nome_produto', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.first_name', read_only=True)

    class Meta:
        model = Movimentacao
        # 🚨 CORREÇÃO 1: Use uma lista explícita de campos aqui 🚨
        fields = [
            'id', 'produto', 'produto_nome', 'categoria_movimentacao', 
            'quantidade_movimentacao', 'data_movimentacao', 'usuario', 
            'usuario_nome', 'observacao_movimentacao'
        ]
        read_only_fields = ('usuario', 'data_movimentacao')
        
    # ... (seu método validate) ...
    # ...

# ----------------------------------------------------------------------
# A classe que estava dando erro:
class SaidaMovimentacaoSerializer(MovimentacaoSerializer):
    class Meta(MovimentacaoSerializer.Meta):
        # 🚨 CORREÇÃO 2: Agora fields é uma lista + lista, e funciona 🚨
        fields = MovimentacaoSerializer.Meta.fields + ['alerta_estoque']

        # Se você não precisar de SaidaMovimentacaoSerializer,
        # pode simplesmente remover essa classe, pois a lógica de alerta
        # já está sendo retornada diretamente no Response do ViewSet.
        # Se ela for usada apenas para a resposta, o método abaixo
        # é a forma mais simples:
        # fields = list(MovimentacaoSerializer.Meta.fields) + ['alerta_estoque']
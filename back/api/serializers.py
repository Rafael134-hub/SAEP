# api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
# Assumindo que você tem 'Produto' e 'Movimentacao' definidos em .models
from .models import Produto, Movimentacao 

# --- 1. Serializer do Usuário ---
# Usado para obter o nome do responsável na listagem de movimentações
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'


# --- 2. Serializer Base para Movimentação ---
class MovimentacaoSerializer(serializers.ModelSerializer):
    # Campos customizados para exibir informações relacionadas (read_only)
    produto_nome = serializers.CharField(source='produto.nome_produto', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.first_name', read_only=True)
    
    # Validação do Serializer, se você precisar de uma lógica que não seja apenas de Model.
    # Se a validação for mais complexa, é melhor movê-la para o método perform_create/update no ViewSet.
    # Exemplo:
    # def validate(self, data):
    #    # Lógica de validação aqui...
    #    return data

    class Meta:
        model = Movimentacao
        # Definido como LISTA (usando colchetes [])
        fields = [
            'id', 'produto', 'produto_nome', 'categoria_movimentacao', 
            'quantidade_movimentacao', 'data_movimentacao', 'usuario', 
            'usuario_nome', 'observacao_movimentacao'
        ]
        # Campos que o usuário não envia, mas são preenchidos no backend
        read_only_fields = ('usuario', 'data_movimentacao')
        
# ----------------------------------------------------------------------

# --- 3. Serializer para Resposta de Saída/Alerta ---
# Este Serializer deve ser usado para SERIALIZAR a resposta do POST (create)
# no ViewSet, quando você quiser incluir o campo 'alerta_estoque'.
class SaidaMovimentacaoSerializer(MovimentacaoSerializer):
    # 🚨 CORREÇÃO 1: Declare o campo na classe para que o DRF o reconheça
    alerta_estoque = serializers.CharField(read_only=True)

    class Meta(MovimentacaoSerializer.Meta):
        # 🚨 CORREÇÃO 2: Use LISTAS [] para a concatenação 
        # (LISTA do Serializer Base + LISTA do novo campo)
        fields = MovimentacaoSerializer.Meta.fields + ['alerta_estoque']
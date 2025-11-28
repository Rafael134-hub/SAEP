from django.db import models
from django.contrib.auth.models import User

class Produto(models.Model):
    id = models.AutoField(primary_key=True)
    nome_produto = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    descricao_produto = models.TextField(blank=True, verbose_name="Descrição")
    estoque_atual_produto = models.IntegerField(default=0, verbose_name="Estoque Atual")
    estoque_minimo_produto = models.IntegerField(default=1, verbose_name="Estoque Mínimo")
    unidade_medida_produto = models.CharField(max_length=20, default='unidade', verbose_name="Unidade de Medida")

    def __str__(self):
        return self.nome_produto

class CategoriaMovimentacao(models.Model):
    TIPO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
    ]
    pass

class Movimentacao(models.Model):
    TIPO_MOVIMENTACAO = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
    ]
    
    id = models.AutoField(primary_key=True)
    produto_id = models.ForeignKey(Produto, on_delete=models.PROTECT, related_name='movimentacoes', verbose_name="Produto")
    categoria_movimentacao = models.CharField(max_length=7, choices=TIPO_MOVIMENTACAO, verbose_name="Tipo de Movimentação")
    quantidade_movimentacao = models.IntegerField(verbose_name="Quantidade")
    data_movimentacao = models.DateTimeField(verbose_name="Data", auto_now_add=True) 
    usuario = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name="Responsável")
    observacao_movimentacao = models.TextField(blank=True, verbose_name="Observação")

    def __str__(self):
        return f"{self.categoria_movimentacao} de {self.quantidade_movimentacao} em {self.produto_id.nome_produto}"

    def save(self, *args, **kwargs):
        produto = self.produto_id
        
        if self.categoria_movimentacao == 'ENTRADA':
            produto.estoque_atual_produto += self.quantidade_movimentacao
        elif self.categoria_movimentacao == 'SAIDA':
            produto.estoque_atual_produto -= self.quantidade_movimentacao
        
        produto.save()
        
        super().save(*args, **kwargs)
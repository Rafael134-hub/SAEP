import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/header/header';
import Alert from '../../components/alert/alert';
import { getAuthApi } from '../../services/api/auth';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// --- Esquema de Validação Zod para Movimentação ---
const movimentacaoSchema = z.object({
 produto_id: z.string().min(1, "Selecione um produto."),
 categoria_movimentacao: z.enum(['ENTRADA', 'SAIDA'], { message: "Selecione o tipo de movimentação." }),
 quantidade_movimentacao: z.coerce.number().int().min(1, "Quantidade deve ser 1 ou mais."),
 observacao_movimentacao: z.string().optional(),
});

const Estoque = () => {
 const navigate = useNavigate();
 const [produtos, setProdutos] = useState([]);
 const [movimentacoes, setMovimentacoes] = useState([]);
 const [loading, setLoading] = useState(true);
 const [formErrors, setFormErrors] = useState({});
 const [alertaEstoque, setAlertaEstoque] = useState(null); 
 const [formData, setFormData] = useState({ 
  produto_id: '', 
  categoria_movimentacao: 'ENTRADA', 
  quantidade_movimentacao: 1,
  observacao_movimentacao: ''
 });

  // Encontra o objeto do produto selecionado no formulário para exibição do estoque atual
 const produtoSelecionado = produtos.find(p => p.id === parseInt(formData.produto_id));
  
  // Função para buscar dados de produtos e movimentações
 const fetchData = useCallback(async () => {
  setLoading(true); 
    try {
      const authApi = getAuthApi();
   
   const prodResponse = await authApi.get('produtos/'); 
   setProdutos(prodResponse.data);
   
   const movResponse = await authApi.get('movimentacoes/');
   setMovimentacoes(movResponse.data);
  } catch (error) {
   console.error("Erro ao carregar dados:", error);
  } finally {
   setLoading(false);
  }
 }, []);

 useEffect(() => {
  fetchData();
 }, [fetchData]);
 
 const handleChange = (e) => {
    const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
  setFormErrors({});
  setAlertaEstoque(null);
 };

  // Função para registrar a movimentação
 const handleMovimentacao = async (e) => {
  e.preventDefault();
  setFormErrors({});
  setAlertaEstoque(null);
    
    const authApi = getAuthApi(); 
  
  try {
   const validatedData = movimentacaoSchema.parse(formData);

   // 🚨 CORREÇÃO NO PAYLOAD: Substituir produto_id pelo nome da FK esperado pelo Django (produto)
   const payload = {
    // Usa o ID do produto validado e nomeia a chave como 'produto'
    produto: validatedData.produto_id, 
    categoria_movimentacao: validatedData.categoria_movimentacao,
    quantidade_movimentacao: parseInt(validatedData.quantidade_movimentacao), 
    observacao_movimentacao: validatedData.observacao_movimentacao, // Usa a observação validada
   };

   const response = await authApi.post('movimentacoes/', payload);

   // Tratamento do Alerta de Estoque Mínimo (Disparado pelo backend)
   if (response.data.alerta_estoque) {
        // Seta o estado para exibir o alerta no componente <Alert>
    setAlertaEstoque(response.data.alerta_estoque); 
        // Dispara o alerta nativo para maior ênfase
    window.alert(response.data.alerta_estoque); 
   }

   // Sucesso: atualiza listas e limpa formulário
   setFormData({ produto_id: '', categoria_movimentacao: 'ENTRADA', quantidade_movimentacao: 1, observacao_movimentacao: '' });
   fetchData(); // Recarrega dados para atualizar estoque atual
   
  } catch (err) {
   if (err instanceof z.ZodError) {
    const newErrors = err.errors.reduce((acc, current) => {
     acc[current.path[0]] = current.message;
     return acc;
    }, {});
    setFormErrors(newErrors);
   } else if (err.response && err.response.data.quantidade_movimentacao) {
    // Erro de estoque insuficiente vindo do Django
    setFormErrors({ quantidade_movimentacao: err.response.data.quantidade_movimentacao[0] });
   } else {
    console.error("Erro ao registrar:", err);
    setFormErrors({ global: "Erro ao registrar. Tente novamente." });
   }
  }
 };
 
 const TabelaMovimentacao = () => (
  <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
   <h3 className="text-xl font-bold p-4 border-b">Histórico de Movimentações</h3>
   <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
     <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data (7.1.3)</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável (7.1.3)</th>
     </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
     {movimentacoes.map(m => (
      <tr key={m.id}>
       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(m.data_movimentacao).toLocaleDateString()}</td>
       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.produto_nome}</td>
       <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${m.categoria_movimentacao === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
        {m.categoria_movimentacao}
       </td>
       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.quantidade_movimentacao}</td>
       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.usuario_nome || 'N/A'}</td> 
      </tr>
     ))}
    </tbody>
   </table>
  </div>
 );

 const MovimentacaoForm = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg h-full">
   <h3 className="text-xl font-bold mb-4">Registrar Entrada/Saída (7.1.2)</h3>
   <form onSubmit={handleMovimentacao} className="space-y-4">
    {formErrors.global && <Alert message={formErrors.global} type="error" className="mb-4" />}
        {/* Alerta Visual de Estoque Mínimo, se retornado pelo backend */}
    {alertaEstoque && <Alert message={alertaEstoque} type="stock-alert" className="mb-4" />}
    
    {/* Seleção de Produto */}
    <div>
     <label className="block text-sm font-medium text-gray-700">Produto</label>
     <select name="produto_id" value={formData.produto_id} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-lg p-2">
      <option value="">Selecione um produto</option>
      {produtos.map(p => (
       <option key={p.id} value={p.id}>{p.nome_produto} (Atual: {p.estoque_atual_produto})</option>
      ))}
     </select>
     {formErrors.produto_id && <p className="text-xs text-red-500 mt-1">{formErrors.produto_id}</p>}
    </div>

        {/* ✅ CAMPO DE ESTOQUE ATUAL (Aparece somente após a seleção do produto) */}
    {produtoSelecionado && (
     <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm font-semibold">
      Estoque Atual: <span className="text-blue-700">{produtoSelecionado.estoque_atual_produto} {produtoSelecionado.unidade_medida_produto}</span>
      {produtoSelecionado.estoque_atual_produto <= produtoSelecionado.estoque_minimo_produto && 
       <span className="ml-2 text-red-600">(Estoque Baixo!)</span>
      }
     </div>
    )}
    
    {/* Tipo de Movimentação */}
    <div>
     <label className="block text-sm font-medium text-gray-700">Tipo</label>
     <select name="categoria_movimentacao" value={formData.categoria_movimentacao} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-lg p-2">
      <option value="ENTRADA">ENTRADA</option>
      <option value="SAIDA">SAÍDA</option>
     </select>
     {formErrors.categoria_movimentacao && <p className="text-xs text-red-500 mt-1">{formErrors.categoria_movimentacao}</p>}
    </div>

    {/* Quantidade */}
    <div>
     <label className="block text-sm font-medium text-gray-700">Quantidade</label>
     <input type="number" name="quantidade_movimentacao" min="1" value={formData.quantidade_movimentacao} onChange={handleChange} 
      className="w-full mt-1 border border-gray-300 rounded-lg p-2" />
     {formErrors.quantidade_movimentacao && <p className="text-xs text-red-500 mt-1">{formErrors.quantidade_movimentacao}</p>}
    </div>
    
    {/* Observação */}
    <div>
     <label className="block text-sm font-medium text-gray-700">Observação (Opcional)</label>
     <textarea name="observacao_movimentacao" value={formData.observacao_movimentacao} onChange={handleChange} 
      className="w-full mt-1 border border-gray-300 rounded-lg p-2" rows="2" />
    </div>

    <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 shadow-md">
     Registrar Movimentação
    </button>
   </form>
  </div>
 );

 return (
  <div className="min-h-screen bg-gray-50">
   <Header />
   <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <button onClick={() => navigate('/home')} className="mb-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center">&larr; Voltar para Home</button>
    <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestão de Estoque</h2>

    {loading ? (
     <p className="text-gray-500">Carregando dados de estoque...</p>
    ) : (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1">
       <MovimentacaoForm />
      </div>
      <div className="lg:col-span-2">
       <TabelaMovimentacao />
      </div>
     </div>
    )}
   </div>
   
  </div>
 );
};

export default Estoque;
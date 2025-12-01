// src/pages/Produtos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Header from '../../components/header/header';
import Alert from '../../components/alert/alert';
import { getAuthApi } from '../../services/api/auth';

// --- Esquema de Validação Zod ---
const produtoSchema = z.object({
    nome_produto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
    descricao_produto: z.string().optional(),
    estoque_minimo_produto: z.coerce.number().int().min(1, "O estoque mínimo deve ser 1 ou mais."),
    unidade_medida_produto: z.string().min(1, "Unidade de medida é obrigatória."),
    // NOVO: Adicionado estoque_atual_produto, deve ser um número inteiro >= 0.
    estoque_atual_produto: z.coerce.number().int().min(0, "O estoque atual não pode ser negativo.").optional(),
});

// --- Componente Modal/Form ---
const ProdutoFormModal = ({ isOpen, onClose, produtoData, refetch }) => {
    const [formData, setFormData] = useState(produtoData || {});
    const [errors, setErrors] = useState({});
    const isEdit = !!produtoData;

    useEffect(() => {
        // Garante que os valores iniciais (ou default) são setados quando o modal abre
        const defaultValues = { 
            nome_produto: '', 
            descricao_produto: '', 
            estoque_minimo_produto: 1, 
            unidade_medida_produto: 'unidade',
            // Inicializa com 0 para novos produtos
            estoque_atual_produto: 0, 
        };
        // Se estiver editando, copia os dados. Se for novo, usa os valores padrão.
        setFormData(produtoData ? { ...produtoData } : defaultValues);
        setErrors({});
    }, [produtoData, isOpen]);

    if (!isOpen) return null;

    // Função para manipular mudanças no formulário
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            // Converte para Number (inteiro) se o campo for 'number', senão mantém o valor
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const authApi = getAuthApi();

        try {
            // Se for novo produto, o estoque_atual_produto é obrigatório pelo formulário, mas o Zod lida com o parse.
            // Se for edição, o campo de estoque atual não aparece, então ele não deve ser validado.
            let validatedData = isEdit ? 
                produtoSchema.omit({ estoque_atual_produto: true }).parse(formData) : 
                produtoSchema.parse(formData);

            if (isEdit) {
                // Remove o estoque atual da edição, pois ele é controlado por movimentações.
                delete validatedData.estoque_atual_produto; 
                await authApi.put(`produtos/${produtoData.id}/`, validatedData); // Edição
            } else {
                await authApi.post('produtos/', validatedData); // Inserção
            }

            refetch();
            onClose();
        } catch (err) {
            console.error('Erro ao salvar produto:', err);
            if (err instanceof z.ZodError) {
                const newErrors = err.errors.reduce((acc, current) => {
                    acc[current.path[0]] = current.message;
                    return acc;
                }, {});
                setErrors(newErrors);
            } else if (err.response && err.response.status === 401) {
                setErrors({ global: "Sessão expirada. Por favor, faça login novamente." });
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } else if (err.response && err.response.data) {
                if (err.response.data.nome_produto) {
                    setErrors({ nome_produto: "Este nome de produto já existe." });
                } else {
                    const backendErrors = Object.entries(err.response.data).reduce((acc, [key, value]) => {
                        acc[key] = Array.isArray(value) ? value.join(', ') : value;
                        return acc;
                    }, {});
                    setErrors(backendErrors);
                }
            } else {
                setErrors({ global: "Erro ao salvar. Verifique sua conexão ou tente novamente." });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
                {errors.global && <Alert message={errors.global} type="error" className="mb-4" />}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label htmlFor="nome_produto" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                        <input type="text" name="nome_produto" id="nome_produto"
                            value={formData.nome_produto || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        {errors.nome_produto && <p className="text-red-500 text-xs mt-1">{errors.nome_produto}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="unidade_medida_produto" className="block text-sm font-medium text-gray-700">Unidade de Medida</label>
                        <input type="text" name="unidade_medida_produto" id="unidade_medida_produto"
                            value={formData.unidade_medida_produto || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        {errors.unidade_medida_produto && <p className="text-red-500 text-xs mt-1">{errors.unidade_medida_produto}</p>}
                    </div>

                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="estoque_minimo_produto" className="block text-sm font-medium text-gray-700">Estoque Mínimo</label>
                            <input type="number" name="estoque_minimo_produto" id="estoque_minimo_produto"
                                value={formData.estoque_minimo_produto || 1}
                                onChange={handleChange}
                                min="1"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.estoque_minimo_produto && <p className="text-red-500 text-xs mt-1">{errors.estoque_minimo_produto}</p>}
                        </div>
                        
                        {/* NOVO CAMPO: Estoque Atual (Visível apenas na criação) */}
                        {!isEdit && (
                            <div className="flex-1">
                                <label htmlFor="estoque_atual_produto" className="block text-sm font-medium text-gray-700">Estoque Inicial</label>
                                <input type="number" name="estoque_atual_produto" id="estoque_atual_produto"
                                    value={formData.estoque_atual_produto ?? 0}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                                {errors.estoque_atual_produto && <p className="text-red-500 text-xs mt-1">{errors.estoque_atual_produto}</p>}
                            </div>
                        )}

                        {/* EXIBIÇÃO: Estoque Atual (Visível apenas na edição) */}
                        {isEdit && (
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Estoque Atual</label>
                                <p className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm p-2 text-gray-600 font-semibold">
                                    {produtoData?.estoque_atual_produto || 0} {produtoData?.unidade_medida_produto || ''}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">O estoque é atualizado via Movimentações.</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="descricao_produto" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                        <textarea name="descricao_produto" id="descricao_produto"
                            value={formData.descricao_produto || ''}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- FIM do Componente Modal/Form ---

// -------------------------------------------------------------------
// --- Componente Produtos Principal ---
// -------------------------------------------------------------------

const Produtos = () => {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [termoBusca, setTermoBusca] = useState(''); // Campo de busca
    const [modalOpen, setModalOpen] = useState(false);
    const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
    const [error, setError] = useState(null);

    const buscarProdutos = useCallback(async (termo = '') => {
        setError(null);
        try {
            const authApi = getAuthApi();
            // Aplica o filtro de busca na URL
            const response = await authApi.get(`produtos/?search=${termo}`);
            setProdutos(response.data);
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            if (err.response && err.response.status === 401) {
                setError("Sessão expirada. Por favor, faça login novamente.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } else if (err.response && err.response.data) {
                setError(`Erro: ${Object.values(err.response.data).join(', ')}`);
            } else {
                setError("Erro ao carregar produtos. Verifique sua conexão ou tente novamente.");
            }
        }
    }, []);

    useEffect(() => {
        buscarProdutos(termoBusca);
    }, [buscarProdutos, termoBusca]);

    const handleExcluir = async (id) => {
        // Confirmação nativa antes de excluir
        if (!window.confirm("Confirmar a exclusão deste produto?")) return;

        try {
            const authApi = getAuthApi();
            await authApi.delete(`produtos/${id}/`);
            buscarProdutos(termoBusca);
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            if (error.response && error.response.status === 401) {
                setError("Sessão expirada. Por favor, faça login novamente.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } else if (error.response && error.response.data) {
                setError(`Erro ao excluir: ${Object.values(error.response.data).join(', ')}`);
            } else {
                setError('Erro ao excluir produto. Ele pode estar associado a movimentações ou houve um problema de conexão.');
            }
        }
    };

    const handleOpenModal = (produto = null) => {
        setProdutoEmEdicao(produto);
        setModalOpen(true);
    };

    // Verifica se há algum produto com estoque baixo para exibir o alerta
    const temEstoqueBaixo = produtos.some(p => p.estoque_atual_produto < p.estoque_minimo_produto);


    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Botão de Retorno */}
                <button onClick={() => navigate('/')} className="mb-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center">&larr; Voltar para Home</button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestão de Produtos</h2>
                
                <div className="flex justify-between items-center mb-6">
                    {/* Campo de Busca */}
                    <input type="text" placeholder="Buscar produto..." value={termoBusca} 
                        onChange={(e) => setTermoBusca(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 w-full max-w-xs focus:ring-blue-500" 
                    />
                    
                    <button onClick={() => handleOpenModal(null)}
                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 shadow-md"
                    >
                        + Novo Produto
                    </button>
                </div>

                {error && <Alert message={error} type="error" className="mb-4" />}
                
                {/* ALERTA VISUAL DE ESTOQUE BAIXO */}
                {temEstoqueBaixo && (
                    <Alert
                        message="Atenção: Existem produtos com estoque abaixo do nível mínimo. Verifique os itens destacados em vermelho na tabela."
                        type="stock-alert"
                        className="mb-4"
                    />
                )}

                {/* Tabela de Produtos */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* CABEÇALHO DA TABELA */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Mínimo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {produtos.map(p => (
                                <tr
                                    key={p.id}
                                    className={p.estoque_atual_produto < p.estoque_minimo_produto ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nome_produto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">
                                        {p.estoque_atual_produto} {p.unidade_medida_produto}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.estoque_minimo_produto} {p.unidade_medida_produto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                                        <button onClick={() => handleExcluir(p.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Criação/Edição */}
            <ProdutoFormModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                produtoData={produtoEmEdicao}
                refetch={() => buscarProdutos(termoBusca)} 
            />
        </div>
    );
};

export default Produtos;
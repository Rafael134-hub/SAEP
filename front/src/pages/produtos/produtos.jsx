// src/pages/Produtos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Header from '../components/Layout/Header';
import Alert from '../components/UI/Alert';
import { authApi } from '../api/auth';

// --- Esquema de Validação Zod (Entrega 6.1.6) ---
const produtoSchema = z.object({
    nome_produto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
    descricao_produto: z.string().optional(),
    estoque_minimo_produto: z.coerce.number().int().min(1, "O estoque mínimo deve ser 1 ou mais."),
    unidade_medida_produto: z.string().min(1, "Unidade de medida é obrigatória."),
});

// --- Componente Modal/Form (Embutido ou Separado para evitar repetição) ---
// Para fins de componentização limpa, este modal estaria em src/components/Produtos/ProdutoFormModal.jsx
const ProdutoFormModal = ({ isOpen, onClose, produtoData, refetch }) => {
    const [formData, setFormData] = useState(produtoData || {});
    const [errors, setErrors] = useState({});
    const isEdit = !!produtoData;

    useEffect(() => {
        setFormData(produtoData || { nome_produto: '', descricao_produto: '', estoque_minimo_produto: 1, unidade_medida_produto: 'unidade' });
        setErrors({});
    }, [produtoData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const validatedData = produtoSchema.parse(formData);
            
            if (isEdit) {
                await authApi.put(`produtos/${produtoData.id}/`, validatedData); // Edição (Entrega 6.1.4)
            } else {
                await authApi.post('produtos/', validatedData); // Inserção (Entrega 6.1.3)
            }
            
            refetch();
            onClose();
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors = err.errors.reduce((acc, current) => {
                    acc[current.path[0]] = current.message;
                    return acc;
                }, {});
                setErrors(newErrors);
            } else if (err.response && err.response.data.nome_produto) {
                 setErrors({ nome_produto: "Este nome de produto já existe." });
            } else {
                 setErrors({ global: "Erro ao salvar. Verifique sua conexão." });
            }
        }
    };
    
    // ... (JSX do modal, input fields, botões)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
                {errors.global && <Alert message={errors.global} type="error" className="mb-4" />}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... Campos de formulário com feedback de erro (Entrega 6.1.6) */}
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

const Produtos = () => {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [termoBusca, setTermoBusca] = useState(''); // Campo de busca (Entrega 6.1.2)
    const [modalOpen, setModalOpen] = useState(false);
    const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
    const [error, setError] = useState(null);

    const buscarProdutos = useCallback(async (termo = '') => {
        setError(null);
        try {
            // Aplica o filtro de busca na URL (Entrega 6.1.2)
            const response = await authApi.get(`produtos/?busca=${termo}`); 
            setProdutos(response.data); // Listagem (Entrega 6.1.1)
        } catch (err) {
            setError("Erro ao carregar produtos. Sessão expirada?");
        }
    }, []);

    useEffect(() => {
        buscarProdutos(termoBusca);
    }, [buscarProdutos, termoBusca]);

    const handleExcluir = async (id) => {
        if (!window.confirm("Confirmar a exclusão deste produto?")) return;
        try {
            await authApi.delete(`produtos/${id}/`); // Exclusão (Entrega 6.1.5)
            buscarProdutos(termoBusca);
        } catch (error) {
            setError('Erro ao excluir produto. Ele pode estar associado a movimentações.');
        }
    };

    const handleOpenModal = (produto = null) => {
        setProdutoEmEdicao(produto);
        setModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Botão de Retorno (Entrega 6.1.7) */}
                <button onClick={() => navigate('/home')} className="mb-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center">&larr; Voltar para Home</button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestão de Produtos</h2>
                
                <div className="flex justify-between items-center mb-6">
                    {/* Campo de Busca (Entrega 6.1.2) */}
                    <input type="text" placeholder="Buscar produto..." value={termoBusca} 
                           onChange={(e) => setTermoBusca(e.target.value)}
                           className="border border-gray-300 rounded-lg p-2 w-full max-w-xs focus:ring-blue-500" />
                    
                    <button onClick={() => handleOpenModal(null)}
                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 shadow-md"
                    >
                        + Novo Produto
                    </button>
                </div>

                {error && <Alert message={error} type="error" className="mb-4" />}

                {/* Tabela de Produtos (Entrega 6.1.1) */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                    {/* ... (Tabela de listagem) */}
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* ... */}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {produtos.map(p => (
                                <tr key={p.id} className={`${p.estoque_atual_produto < p.estoque_minimo_produto ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nome_produto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{p.estoque_atual_produto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.estoque_minimo_produto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                                        <button onClick={() => handleExcluir(p.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal de Criação/Edição */}
                <ProdutoFormModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)} 
                    produtoData={produtoEmEdicao}
                    refetch={() => buscarProdutos(termoBusca)} 
                />
            </div>
        </div>
    );
};

export default Produtos;
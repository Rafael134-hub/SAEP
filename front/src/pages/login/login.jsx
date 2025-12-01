import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
// 🚨 Importa apenas a função login do seu serviço
import { login } from '../../services/api/auth'; 
// 🚨 REMOVIDA A LINHA: import useAuthStore from '../stor';
import Alert from '../../components/alert/alert';

const loginSchema = z.object({
    username: z.string().min(1, "Nome de usuário é obrigatório."),
    password: z.string().min(1, "Senha é obrigatória."),
});

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    // 🚨 REMOVIDA A LINHA: const setAuth = useAuthStore((state) => state.setAuth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            loginSchema.parse(formData); // Validação Zod
            
            // 🚨 SIMPLIFICADO: A função login já salva o token no localStorage
            await login(formData.username, formData.password);
            
            // Redirecionamento após login bem-sucedido (Entrega 5)
            navigate('/products'); // Use '/products' ou '/home' conforme o seu App.jsx
            
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError("Preencha todos os campos.");
            } else if (err.response && err.response.status === 401) {
                // Erro de credencial do Django (Entrega 4.1)
                setError("Credenciais inválidas. Tente novamente."); 
            } else {
                setError("Erro de conexão ou servidor. Tente novamente.");
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800">Login no Sistema</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && <Alert message={error} type="error" />}
                    
                    {/* Campo Usuário */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Usuário
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Campo Senha */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
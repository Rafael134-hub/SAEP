// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from '../api/auth';
import useAuthStore from '../store/authStore';
import Alert from '../components/UI/Alert';

const loginSchema = z.object({
    username: z.string().min(1, "Nome de usuário é obrigatório."),
    password: z.string().min(1, "Senha é obrigatória."),
});

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    // ... (funções handleChange e handleSubmit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            loginSchema.parse(formData); // Validação Zod
            const { user } = await login(formData.username, formData.password);
            
            setAuth({ isAuthenticated: true, user });
            navigate('/home'); // Redirecionamento (Entrega 5)

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
                    {/* ... (Campos de Usuário e Senha) */}
                    <button type="submit"
                        className="w-full py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 🚨 Importar a função 'logout' e 'getAuthApi' do seu serviço
import { logout, getAuthApi } from '../../services/api/auth'; 

const Header = () => {
    const navigate = useNavigate();
    // 🚨 Removido o import do useAuthStore
    const [userName, setUserName] = useState('...');

    // Função de Logout (Requisito 5.1.2)
    const handleLogout = () => {
        // Chama a função que limpa o localStorage
        logout(); 
        navigate('/login'); 
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            // Cria uma instância Axios com o token Bearer
            const authApiInstance = getAuthApi(); 
            
            try {
                // 💡 Esta rota 'user/info/' precisa existir no seu Django (urls.py e views.py)
                const response = await authApiInstance.get('user/info/'); 
                // Assumindo que a API retorna 'first_name' ou 'username'
                setUserName(response.data.first_name || response.data.username); 
            } catch (error) {
                // Se o token for inválido/expirado, força o logout
                handleLogout(); 
            }
        };

        // Verifica se há um token antes de tentar buscar a info
        if (localStorage.getItem('accessToken')) {
            fetchUserInfo();
        } else {
            // Se não tiver token, garante que o usuário vá para o login
            handleLogout(); 
        }
    }, []);

    return (
        <header className="flex justify-between items-center pb-4 border-b border-gray-200 bg-white p-4 shadow-md sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('/products')}>
                📦 Sistema de Estoque SAEP
            </h1>
            <div className="flex items-center space-x-4">
                <span className="text-md text-gray-700">
                    Bem-vindo(a), <span className="font-semibold">{userName}</span> 
                </span>
                <button 
                    onClick={handleLogout}
                    className="px-3 py-1 text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-150 text-sm"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
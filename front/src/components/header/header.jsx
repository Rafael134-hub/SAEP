// src/components/Layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../api/auth';

const Header = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [userName, setUserName] = useState('...');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // Obter info do usuário logado (Entrega 5.1.1)
                const response = await authApi.get('user/info/');
                setUserName(response.data.first_name || response.data.username);
            } catch (error) {
                handleLogout(); // Forçar logout em caso de token inválido
            }
        };
        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        logout(); // Limpar o estado global e local storage (Entrega 5.1.2)
        navigate('/login'); 
    };

    return (
        <header className="flex justify-between items-center pb-4 border-b border-gray-200 bg-white p-4 shadow-md sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('/home')}>
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
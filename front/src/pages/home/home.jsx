// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';

const Card = ({ title, description, path }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(path)}
            className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer border-t-4 border-blue-500 transform hover:scale-[1.02]"
        >
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Módulos do Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card Cadastro de Produto (Entrega 5.1.3) */}
                    <Card 
                        title="Cadastro de Produto" 
                        description="Gerencie, cadastre e edite os produtos disponíveis no sistema."
                        path="/produtos" 
                    />
                    {/* Card Gestão de Estoque (Entrega 5.1.4) */}
                    <Card 
                        title="Gestão de Estoque" 
                        description="Registre entradas e saídas e monitore o estoque atual e alertas."
                        path="/estoque" 
                    />
                </div>
            </main>
        </div>
    );
};

export default Home;
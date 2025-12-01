import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importe suas páginas
import LoginPage from './pages/login/login';
import ProductPage from './pages/produtos/produtos';
import StockPage from './pages/estoque/estoque';

// Componente para proteger rotas (Item 4: Autenticação)
const PrivateRoute = ({ children }) => {
  // 🚨 CORREÇÃO 3: Checa por 'accessToken', correspondente ao que o login armazena agora.
  const isAuthenticated = localStorage.getItem('accessToken');

  // Se não estiver autenticado, redireciona para o login
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota de Login (Página de acesso público) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas Protegidas (Exigem autenticação) */}

        {/* Rota Raiz, redireciona para a principal (Item 5) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Navigate to="/products" replace />
            </PrivateRoute>
          }
        />

        {/* Rota de Cadastro de Produto (Item 6) */}
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <ProductPage />
            </PrivateRoute>
          }
        />

        {/* Rota de Gestão de Estoque (Item 7) */}
        <Route
          path="/stock"
          element={
            <PrivateRoute>
              <StockPage />
            </PrivateRoute>
          }
        />

        {/* Rota para lidar com caminhos não encontrados */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
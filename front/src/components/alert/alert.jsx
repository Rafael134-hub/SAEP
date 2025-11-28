// src/components/UI/Alert.jsx
import React from 'react';

const Alert = ({ message, type = 'info', className = '' }) => {
    if (!message) return null;

    const baseStyle = "p-4 rounded-lg text-sm font-medium";
    let style = "";

    switch (type) {
        case 'error':
            style = "bg-red-100 text-red-800 border border-red-400";
            break;
        case 'success':
            style = "bg-green-100 text-green-800 border border-green-400";
            break;
        case 'stock-alert': // Estilo para Alerta de Estoque Mínimo (Entrega 7.1.4)
            style = "bg-orange-100 text-orange-800 border border-orange-400 font-bold";
            break;
        default:
            style = "bg-blue-100 text-blue-800 border border-blue-400";
    }

    return (
        <div className={`${baseStyle} ${style} ${className}`} role="alert">
            {message}
        </div>
    );
};

export default Alert;
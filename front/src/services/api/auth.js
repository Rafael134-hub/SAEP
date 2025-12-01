import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';


export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}token/`, { username, password });

        // 🚨 CORREÇÃO 1: Armazena como 'accessToken'
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);

        return response.data;
    } catch (error) {
        throw error;
    }
};


export const logout = () => {
    // 🚨 CORREÇÃO 2: Removendo apenas as chaves de token que você usa
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // localStorage.removeItem('user'); // Se você não armazena 'user', remova esta linha
};


export const getAuthApi = () => {
    // Já estava correto usando 'accessToken'
    const accessToken = localStorage.getItem('accessToken');

    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });
};
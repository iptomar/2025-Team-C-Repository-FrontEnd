// Aqui fica o URL base da API, que é o mesmo para todas as funções de serviço

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7083/api', // !! Atualizar o URL quando o backend estiver online !!
});

// Adiciona o token JWT ao cabeçalho Authorization em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

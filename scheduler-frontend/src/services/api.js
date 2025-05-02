// Aqui fica o URL base da API, que é o mesmo para todas as funções de serviço

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7083/api', // !! Atualizar o URL quando o backend estiver online !!
});

export default api;

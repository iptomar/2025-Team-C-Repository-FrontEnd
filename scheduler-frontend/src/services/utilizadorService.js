import api from './api';

// Serviço para interagir com a API de utilizadores.
const utilizadorService = {
  getDocentes: () => api.get('/ApiUtilizadores/GetDocentes'), // Aqui busca por ID do docente
};

export default utilizadorService;
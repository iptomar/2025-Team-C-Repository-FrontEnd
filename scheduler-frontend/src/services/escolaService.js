import api from './api';

// Serviço para interagir com a API de escolas
// Este serviço contém funções para obter, criar, atualizar e excluir escolas
const EscolaService = {
  getAll: () => api.get('/ApiEscola/GetAllEscolas'),
  getById: (id) => api.get(`/ApiEscola/GetById/${id}`),
  create: (escola) => api.post('/ApiEscola/Create', escola),
  update: (id, escola) => api.put(`/ApiEscola/Update/${id}`, escola),
  delete: (id) => api.delete(`/ApiEscola/Delete/${id}`)
};

export default EscolaService;
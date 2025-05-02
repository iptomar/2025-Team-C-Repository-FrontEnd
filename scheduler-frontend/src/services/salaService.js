import api from './api';

// Serviço para interagir com a API de salas.
// Este serviço contém funções para obter, criar, atualizar e excluir salas.
const salaService = {
  getAll: () => api.get('/ApiSalas/GetAll'),
  GetByEscola: (id) => api.get(`/ApiSalas/GetByEscola/${id}`), // Aqui busca por ID da escola
  GetById: (id) => api.get(`/ApiSalas/GetById/${id}`), // Aqui busca por ID da sala
  create: (sala) => api.post('/ApiSalas/Create', sala),
  update: (id, sala) => api.put(`/ApiSalas/Update/${id}`, sala), // Edita a sala pelo o ID da sala
  delete: (id) => api.delete(`/ApiSalas/Delete/${id}`) // Apaga a sala pelo o ID da sala
};

export default salaService;
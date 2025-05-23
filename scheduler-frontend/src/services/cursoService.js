import api from './api';

// Serviço para interagir com a API de cursos
// Este serviço contém funções para obter, criar, atualizar e excluir cursos
const cursoService = {
  getAll: () => api.get('/ApiCurso/GetAll'),
  getById: (id) => api.get(`/ApiCurso/GetById/${id}`),
  create: (curso) => api.post('/ApiCurso/Create', curso),
  update: (id, curso) => api.put(`/ApiCurso/Update/${id}`, curso),
  delete: (id) => api.delete(`/ApiCurso/Delete/${id}`)
};

export default cursoService;
import api from './api';

// Serviço para interagir com a API de turmas.
// Este serviço contém funções para obter, criar, atualizar e excluir turmas.
const turmaService = {
  getAll: () => api.get('/ApiTurmas/GetAll'),
  GetByDisciplina: (id) => api.get(`/ApiTurmas/GetByDisciplina/${id}`), // Aqui busca por ID da disciplina
  GetById: (id) => api.get(`/ApiTurmas/GetById/${id}`), // Aqui busca por ID da turma
  GetByCurso: (id) => api.get(`/ApiTurmas/GetByCurso/${id}`), // Aqui busca por Curso
  create: (turma) => api.post('/ApiTurmas/Create', turma),
  update: (id, turma) => api.put(`/ApiTurmas/Update/${id}`, turma), // Edita a sala pelo o ID da turma
  delete: (id) => api.delete(`/ApiTurmas/Delete/${id}`) // Apaga a sala pelo o ID da turma
};

export default turmaService;
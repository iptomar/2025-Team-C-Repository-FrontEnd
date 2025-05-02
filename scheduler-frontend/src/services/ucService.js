import api from './api';

// Serviço para interagir com a API das UCs.
// Este serviço contém funções para obter, criar, atualizar e excluir UCs.
const ucService = {
  getAll: () => api.get('/ApiUCs/GetAll'),
  GetById: (id) => api.get(`/ApiUCs/GetById/${id}`), // Aqui busca por ID da UCs
  GetBySemestre: (semestre) => api.get(`/ApiUCs/GetBySemestre/${semestre}`), // Aqui busca por semestre da UCs
  GetByTipo: (tipo) => api.get(`/ApiUCs/GetByTipo/${tipo}`), // Aqui busca por tipo da UCs
  GetByGrau: (grau) => api.get(`/ApiUCs/GetByGrau/${grau}`), // Aqui busca por grau da UCs
  GetByDocente: (docenteId) => api.get(`/ApiUCs/GetByDocente/${docenteId}`), // Aqui busca por ID do Docente da UCs
  create: (UC) => api.post('/ApiUCs/Create', UC),
  update: (id, UC) => api.put(`/ApiUCs/Update/${id}`, UC), // Edita a UC pelo o ID da UC
  delete: (id) => api.delete(`/ApiUCs/Delete/${id}`), // Apaga a UC pelo o ID da UC
  addDocente: (id, docenteId) => api.post(`/ApiUCs/AddDocente/${id}/${docenteId}`), // Adiciona um docente à UC pelo o ID da UC e do docente
  removeDocente: (id, docenteId) => api.delete(`/ApiUCs/RemoveDocente/${id}/${docenteId}`) // Remove um docente da UC pelo o ID da UC e do docente
};

export default ucService;
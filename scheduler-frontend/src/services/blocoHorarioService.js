import api from './api';

// Serviço para interagir com a API de Blocos Horários.
// Este serviço contém funções para obter, criar, atualizar e excluir Blocos Horarios.
const blocoHorarioService = {
  getAll: () => api.get('/ApiBlocosHorario/GetAll'),
  GetById: (id) => api.get(`/ApiBlocosHorario/GetById/${id}`), // Aqui busca por ID do bloco horário
  create: (bloco) => api.post('/ApiBlocosHorario/Create', bloco),
  update: (id, bloco) => api.put(`/ApiBlocosHorario/Update/${id}`, bloco), // Edita o bloco pelo o ID do bloco
  delete: (id) => api.delete(`/ApiBlocosHorario/Delete/${id}`) // Apaga o bloco pelo o ID do bloco
};

export default blocoHorarioService;
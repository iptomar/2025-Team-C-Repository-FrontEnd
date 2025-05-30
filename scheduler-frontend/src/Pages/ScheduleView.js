import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt"; // Importar a localização em português
import "../Styles/ScheduleView.css";
import blocoHorarioService from "../services/blocoHorarioService"; // Importar o serviço de blocos horários
import { useEffect } from "react";
import utilizadorService from "../services/utilizadorService"; // Importar o serviço de utilizadores
import salaService from "../services/salaService"; // Importar o serviço de salas
import ucService from "../services/ucService"; // Importar o serviço de disciplinas
import turmaService from "../services/turmaService"; // Importar o serviço de turmas
import escolaService from "../services/escolaService"; // Importar o serviço das escolas
import cursoService from "../services/cursoService"; // Importar o serviço de cursos
import connection from "../services/signalrConnection";
import { formatRange } from "@fullcalendar/core/index.js";
import { useHistory } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Importar a biblioteca de descodificar as JWTs

const ScheduleView = () => {
  // Novo estado para guardar info do utilizador autenticado
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");

  // Seleção - hierarquia
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");

  // Sem filtros aplicados
  const [allEvents, setAllEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");
  const [subject, setSubject] = useState("");
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Seleção - Filtro
  const [teacherFilter, setTeacherFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Lista - Dropdowns

  // Hierarquia
  const [schoolList, setSchoolList] = useState([]);
  const [degreeList, setDegreeList] = useState([]);

  const [filteredDegreeList, setFilteredDegreeList] = useState([]); // Lista de cursos após selecionar escola
  const [filteredSubjectList, setFilteredSubjectList] = useState([]); // Lista de UCs após selecionar curso

  // Criação de blocos
  const [teacherList, setTeacherList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);

  const history = useHistory();
  // 1. Carregar role e userId do JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      );
      setUserId(String(decoded.utilizadorId));
    }
  }, []);

  // Função para buscar blocos horários da API e formatá-los para o FullCalendar
  // Esta função é chamada quando o componente é montado
  const fetchBlocos = async () => {
    try {
      setLoading(true);
      const response = await blocoHorarioService.getAll();

      // Converter os dados da API para o formato de eventos do FullCalendar
      const apiEvents = response.data.map((bloco) => {
        // Montar datas completas para start e end
        // bloco.dia deve estar no formato 'YYYY-MM-DD'
        const start = `${bloco.dia}T${bloco.horaInicio}`;
        const end = `${bloco.dia}T${bloco.horaFim}`;

        return {
          id: bloco.idBloco,
          title: `${bloco.unidadeCurricularNome || "Sem disciplina"} - ${
            bloco.professorNome || "Sem docente"
          } - ${bloco.salaNome || "Sem sala"}`,
          start, // data completa
          end, // data completa
          backgroundColor: "#57BB4C",
          borderColor: "#0d6217",
          extendedProps: {
            teacher: bloco.professorNome,
            teacherId: bloco.professorFK,
            room: bloco.salaNome,
            roomId: bloco.salaFK,
            subject: bloco.unidadeCurricularNome,
            subjectId: bloco.unidadeCurricularFK,
            class: bloco.turmaNome,
            classId: bloco.turmaFK,
          },
        };
      });
      setEvents(apiEvents);
      setAllEvents(apiEvents);
    } catch (error) {
      alert("Erro ao carregar blocos horários.");
    } finally {
      setLoading(false);
    }
  };
  // Hierarquia - Funções para carregar a escola, curso e ano (do curso)

  // Escola
  const fetchSchool = async () => {
    try {
      const response = await escolaService.getAll();
      const escolas = response.data
        .map((escolas) => ({
          idEscola: escolas.idEscola,
          nome: escolas.nome,
        }))
        .sort((a, b) => a.idEscola - b.idEscola); // Ordenar por idEscola de forma crescente
      console.log(escolas);
      setSchoolList(escolas);
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
      return [];
    }
  };

  // Curso
  const fetchDegree = async () => {
    try {
      const response = await cursoService.getAll();
      const cursos = response.data
        .map((curso) => ({
          idCurso: curso.idCurso,
          nome: curso.nome,
          escolaFK: curso.escolaFK,
        }))
        .sort((a, b) => a.idCurso - b.idCurso); // Ordenar por idEscola de forma crescente
      console.log(cursos);
      setDegreeList(cursos);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      return [];
    }
  };

  // Funções para carregar os professores, salas e disciplinas da API

  // Professores
  const fetchProfessores = async () => {
    try {
      const response = await utilizadorService.getDocentes();
      const professores = response.data
        .map((professor) => ({
          idUtilizador: professor.idUtilizador,
          nome: professor.nome,
        }))
        .sort((a, b) => a.idUtilizador - b.idUtilizador); // Ordenar por idUtilizador de forma crescente
      console.log(professores);
      setTeacherList(professores);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      return [];
    }
  };

  // Salas
  const fetchSalas = async () => {
    try {
      const response = await salaService.getAll();
      const salas = response.data
        .map((sala) => ({
          idSala: sala.idSala,
          nome: sala.nome,
        }))
        .sort((a, b) => a.id - b.id); // Ordenar por id de forma crescente
      setRoomList(salas);
    } catch (error) {
      console.error("Erro ao buscar salas:", error);
      return [];
    }
  };

  // Turmas
  const fetchTurmas = async () => {
    try {
      const response = await turmaService.getAll();
      const turmas = response.data
        .map((turma) => ({
          idTurma: turma.idTurma,
          nome: turma.nome,
        }))
        .sort((a, b) => a.id - b.id); // Ordenar por id de forma crescente
      setClassList(turmas);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      return [];
    }
  };

  // Unidades Curriculares
  const fetchUCS = async () => {
    try {
      const response = await ucService.getAll();
      const ucs = response.data
        .map((uc) => ({
          idUC: uc.idUC ?? uc.IdUC, // aceita ambos por compatibilidade
          nomeUC: uc.nomeUC ?? uc.NomeUC,
          cursoFK: uc.cursoFK ?? uc.CursoFK,
        }))
        .sort((a, b) => a.idUC - b.idUC); // Ordenar por idUC de forma crescente
      setSubjectList(ucs);
      console.log(ucs);
    } catch (error) {
      console.error("Erro ao buscar Unidades Curriculares:", error);
      return [];
    }
  };

  // Carregar blocos e as dropdowns quando o componente montar
  // Verificar role e utilizador
  useEffect(() => {
    // Dropdowns hierarquia
    fetchSchool();
    fetchDegree();

    // Dropdowns criação blocos
    fetchBlocos();
    fetchProfessores();
    fetchSalas();
    fetchUCS();
    fetchTurmas();

    // Iniciar conexão com o SignalR
    connection
      .start()
      .then(() => console.log("Conectado ao SignalR"))
      .catch((err) => console.error("Erro ao conectar ao SignalR", err));

    // Eventos recebidos
    connection.on("BlocoAdicionado", (bloco) => {
      const newEvent = {
        id: bloco.idBloco,
        title: `${bloco.unidadeCurricularNome || "Sem disciplina"} - ${
          bloco.professorNome || "Sem docente"
        } - ${bloco.salaNome || "Sem sala"}`,
        start: `${bloco.dia}T${bloco.horaInicio}`,
        end: `${bloco.dia}T${bloco.horaFim}`,
        backgroundColor: "#57BB4C",
        borderColor: "#0d6217",
        extendedProps: {
          teacher: bloco.professorNome,
          teacherId: bloco.professorFK,
          room: bloco.salaNome,
          roomId: bloco.salaFK,
          subject: bloco.unidadeCurricularNome,
          subjectId: bloco.unidadeCurricularFK,
          class: bloco.turmaNome,
          classId: bloco.turmaFK,
        },
      };
      setEvents((prev) => [...prev, newEvent]);
    });

    connection.on("BlocoEditado", (bloco) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === bloco.idBloco
            ? {
                ...event,
                start: `${bloco.dia}T${bloco.horaInicio}`,
                end: `${bloco.dia}T${bloco.horaFim}`,
                extendedProps: {
                  teacher: bloco.professorNome,
                  teacherId: bloco.professorFK,
                  room: bloco.salaNome,
                  roomId: bloco.salaFK,
                  subject: bloco.unidadeCurricularNome,
                  subjectId: bloco.unidadeCurricularFK,
                  class: bloco.turmaNome,
                  classId: bloco.turmaFK,
                },
              }
            : event
        )
      );
    });

    connection.on("BlocoExcluido", (id) => {
      setEvents((prev) => prev.filter((event) => event.id !== id));
    });

    return () => {
      // Limpar listeners ao desmontar
      connection.off("BlocoAdicionado");
      connection.off("BlocoEditado");
      connection.off("BlocoExcluido");
    };
  }, []);

  useEffect(() => {
    if (userRole || userId) {
      if (userRole === "Docente") {
        setTeacherFilter(userId);
      }
    }
  }, [userRole, userId]);

  // 3. Aplica filtros de forma automática / hierarquia
  useEffect(() => {
    applyFilters();
  }, [teacherFilter, roomFilter, classFilter, allEvents, selectedSchool, selectedDegree]);

  // Método de criação de um bloco horário
  // Este método é chamado quando o utilizador clica em uma data no calendário
  const handleDateClick = async (info) => {
    // aceitar criação de blocos apenas se todos os campos estiverem preenchidos
    if (teacher && room && subject) {
      // criar um horário de início corretamente alinhado a partir da data clicada
      const clickTime = new Date(info.dateStr);

      // criar um horário de fim 2 horas após o horário de início
      const endTime = new Date(clickTime);
      endTime.setHours(endTime.getHours() + 2);

      // Formatar data para YYYY-MM-DD
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // formatar horas para o formato esperado pela API (HH:MM:SS)
      const formatTime = (data) => {
        const horas = data.getHours().toString().padStart(2, "0");
        const minutos = data.getMinutes().toString().padStart(2, "0");
        return `${horas}:${minutos}:00`;
      };

      // Preparar dados para enviar à API
      const novoBloco = {
        horaInicio: formatTime(clickTime),
        horaFim: formatTime(endTime),
        dia: formatDate(clickTime),
        professorFK: teacher,
        unidadeCurricularFK: subject,
        salaFK: room,
        turmaFK: 1, // Ainda não implementado, usar 1 como placeholder
      };

      // Enviar requisição POST para a API
      const response = await blocoHorarioService.create(novoBloco);
      if (!(response.status === 201 || response.status === 200)) {
        alert("Erro ao criar bloco horário.");
        return;
      }
    } else {
      alert("Por favor, preencha selecione todos os campos.");
    }
  };

  // Método para lidar com o arrastar/redimensionar de um bloco
  const handleEventEdit = async (info) => {
    const eventId = parseInt(info.event.id);
    const updatedEvent = events.find((event) => event.id === eventId);

    // Preparar dados para enviar à API
    const startDate = new Date(info.event.start);
    const endDate = new Date(info.event.end);

    // Formatar data para YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // formatar horas para o formato esperado pela API (HH:MM:SS)
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}:00`;
    };

    // Preparar dados para enviar à API
    const blocoAtualizado = {
      IdBloco: eventId,
      horaInicio: formatTime(startDate),
      horaFim: formatTime(endDate),
      dia: formatDate(startDate),
      professorFK: Number(updatedEvent.extendedProps.teacherId),
      unidadeCurricularFK: Number(updatedEvent.extendedProps.subjectId),
      salaFK: Number(updatedEvent.extendedProps.roomId),
      turmaFK: Number(updatedEvent.extendedProps.classId) || 1, // fallback para 1 se não existir
    };

    // Enviar requisição PUT para a API
    try {
      const response = await blocoHorarioService.update(
        eventId,
        blocoAtualizado
      );
      if (!(response.status === 200 || response.status === 204)) {
        alert("Erro ao atualizar bloco na API.");
        info.revert();
      }
    } catch (error) {
      alert("Erro ao atualizar bloco na API.");
      info.revert();
    }
  };

  // Método para lidar com a exclusão de um bloco
  const handleDeleteEvent = async (eventId) => {
    try {
      // Apagar o bloco
      const response = await blocoHorarioService.delete(eventId);
      // Tratar o estado da resposta
      if (!(response.status === 200 || response.status === 204)) {
        alert("Erro ao excluir bloco.");
      }
    } catch (error) {
      alert("Erro ao excluir bloco.");
    }
  };

  // Método para formatar o rótulo do slot
  const slotLabelFormatter = (slotInfo) => {
    const start = new Date(slotInfo.date);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    const formatTime = (date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Aplica os filtros
  const applyFilters = () => {
    let filtered = allEvents;

    // Filtrar valores de curso por escola (dropdown)
    if (selectedSchool !== "") {
      setFilteredDegreeList(
        degreeList.filter(
          (degree) => String(degree.escolaFK) === String(selectedSchool)
        )
      );
    } else {
      setFilteredDegreeList(degreeList); // Mostra todos se nenhuma escola estiver selecionada
    }

    // Filtrar valores de UCs por curso (dropdown)
    if (selectedDegree !== "") {
      setFilteredSubjectList(
        subjectList.filter(
          (subject) => String(subject.cursoFK) === String(selectedDegree)
        )
      );
      console.log(filteredSubjectList)
    } else {
      setFilteredSubjectList(subjectList); // Mostra todos se nenhuma escola estiver selecionada
    }

    // Filtrar por docente
    if (teacherFilter !== "") {
      filtered = filtered.filter(
        (event) =>
          String(event.extendedProps.teacherId) === String(teacherFilter)
      );
    }

    // Filtrar por sala
    if (roomFilter !== "") {
      filtered = filtered.filter(
        (event) => String(event.extendedProps.roomId) === String(roomFilter)
      );
    }

    // Filtrar por turma
    if (classFilter !== "") {
      filtered = filtered.filter(
        (event) => String(event.extendedProps.classId) === String(classFilter)
      );
    }

    setEvents(filtered);
  };

  return (
    <div className="container">
      {/* Sidebar só para NÃO docentes */}
      {userRole !== "Docente" && (
        <div className="SideBar">
          <button
            style={{
              width: "100%",
              marginBottom: 16,
              background: "#57BB4C",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              border: "none",
              borderRadius: 4,
              padding: "10px 0",
              cursor: "pointer",
            }}
            onClick={() => history.push("/upload-data")}
          >
            Upload Data
          </button>
          <h2>Hierarquia</h2>

          <div className="form-group">
            <label htmlFor="escola">Escola:</label>
            <select
              id="escola"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
            >
              <option value="">Selecione uma escola</option>
              {schoolList && schoolList.length > 0 ? (
                schoolList.map((school) => (
                  <option key={school.idEscola} value={school.idEscola}>
                    {school.nome}
                  </option>
                ))
              ) : (
                <option disabled>A carregar escolas...</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="curso">Curso:</label>
            <select
              id="curso"
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              disabled={!selectedSchool} // Desabilita se não houver escola selecionada
            >
              <option value="">Selecione um curso</option>
              {filteredDegreeList && filteredDegreeList.length > 0 ? (
                filteredDegreeList.map((degree) => (
                  <option key={degree.idCurso} value={degree.idCurso}>
                    {degree.nome}
                  </option>
                ))
              ) : (
                <option disabled>A carregar cursos...</option>
              )}
            </select>
          </div>

          <h2>Criar Bloco</h2>
          <div className="form-group">
            <label htmlFor="teacher">Professor:</label>
            <select
              id="teacher"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              disabled={!selectedDegree} // Desabilita se não houver curso selecionado
            >
              <option value="">Selecione um professor</option>
              {teacherList && teacherList.length > 0 ? (
                teacherList.map((prof) => (
                  <option key={prof.idUtilizador} value={prof.idUtilizador}>
                    {prof.nome}
                  </option>
                ))
              ) : (
                <option disabled>A carregar professores...</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="room">Sala:</label>
            <select
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              disabled={!selectedDegree} // Desabilita se não houver curso selecionado
            >
              <option value="">Selecione uma sala</option>
              {roomList && roomList.length > 0 ? (
                roomList.map((room) => (
                  <option key={room.idSala} value={room.idSala}>
                    {room.nome}
                  </option>
                ))
              ) : (
                <option disabled>A carregar salas...</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="subject">Disciplina:</label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!selectedDegree} // Desabilita se não houver curso selecionado
            >
              <option value="">Selecione uma Unidade Curricular</option>
              {filteredSubjectList && filteredSubjectList.length > 0 ? (
                filteredSubjectList.map((subject) => (
                  <option key={subject.idUC} value={subject.idUC}>
                    {subject.nomeUC}
                  </option>
                ))
              ) : (
                <option disabled>A carregar UCs...</option>
              )}
            </select>
          </div>

          <h2>Filtros</h2>
          <div className="form-group">
            <label htmlFor="teacherFilter">Docente:</label>
            <select
              id="teacherFilter"
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              disabled={userRole === "Docente"}
            >
              <option value="">Selecione um docente</option>
              {teacherList && teacherList.length > 0 ? (
                teacherList.map((prof) => (
                  <option key={prof.idUtilizador} value={prof.idUtilizador}>
                    {prof.nome}
                  </option>
                ))
              ) : (
                <option disabled>A carregar docentes...</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="roomFilter">Sala:</label>
            <select
              id="roomFilter"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="">Selecione uma sala</option>
              {roomList && roomList.length > 0 ? (
                roomList.map((room) => (
                  <option key={room.idSala} value={room.idSala}>
                    {room.nome}
                  </option>
                ))
              ) : (
                <option disabled>A carregar salas...</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="classFilter">Turma:</label>
            <select
              id="classFilter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">Selecione uma Turma</option>
              {classList && classList.length > 0 ? (
                classList.map((turma) => (
                  <option key={turma.idTurma} value={turma.idTurma}>
                    {turma.nome}
                  </option>
                ))
              ) : (
                <option disabled>A carregar turmas...</option>
              )}
            </select>
          </div>

          <div className="blocks-preview">
            <h3>Blocos Atuais</h3>
            <p className="instructions">
              Preencha os campos acima e clique no calendário para criar um
              bloco
            </p>
            <div className="events-list">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="event-item">
                    <span>{event.title}</span>
                    <button
                      className="delete-event-btn"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      x
                    </button>
                  </div>
                ))
              ) : (
                <p>Nenhum bloco criado ainda</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="ScheduleView">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={ptLocale}
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          }}
          slotMinTime="08:30:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          events={events}
          editable={true}
          eventDrop={handleEventEdit}
          eventResize={handleEventEdit}
          dateClick={handleDateClick}
          slotDuration="00:30:00"
          slotLabelInterval="00:30:00"
          slotLabelContent={slotLabelFormatter}
          eventContent={(eventInfo) => {
            return (
              <div>
                <b>
                  {eventInfo.event.extendedProps?.subject ||
                    eventInfo.event.title}
                </b>
                {eventInfo.event.extendedProps?.teacher && (
                  <div>
                    <i>{eventInfo.event.extendedProps.teacher}</i>
                  </div>
                )}
                {eventInfo.event.extendedProps?.room && (
                  <div>Sala: {eventInfo.event.extendedProps.room}</div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default ScheduleView;

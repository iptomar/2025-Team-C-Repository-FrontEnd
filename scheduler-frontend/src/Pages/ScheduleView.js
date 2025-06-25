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
import Popup from "../Components/Popup";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [selectedClass, setSelectedClass] = useState(""); // Novo estado para turma selecionada
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Seleção - Filtro
  const [teacherFilter, setTeacherFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Lista - Dropdowns
  
  //Evento a ser eliminado
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, eventId: null });
  
  // Popup para mensagens de erro
  const [popup, setPopup] = useState({ open: false, message: "" });

  // Hierarquia
  const [schoolList, setSchoolList] = useState([]);
  const [degreeList, setDegreeList] = useState([]);

  const [filteredDegreeList, setFilteredDegreeList] = useState([]); // Lista de cursos após selecionar escola
  const [filteredSubjectList, setFilteredSubjectList] = useState([]); // Lista de UCs após selecionar curso
  const [filteredClassList, setFilteredClassList] = useState([]); // Lista de turmas após selecionar curso

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
      setPopup({ open: true, message: "Erro ao carregar blocos horários." });
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
          cursoFK: turma.cursoFK || turma.CursoFK, // Suporte para ambos os nomes de propriedade
        }))
        .sort((a, b) => a.idTurma - b.idTurma); // Ordenar por idTurma de forma crescente
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
  }, [
    teacherFilter,
    roomFilter,
    classFilter,
    allEvents,
    selectedSchool,
    selectedDegree,
  ]);

  // Método de criação de um bloco horário
  const handleDateClick = async (info) => {
    // aceitar criação de blocos apenas se todos os campos estiverem preenchidos
    if (teacher && room && subject && selectedClass) {
      try {
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
          turmaFK: selectedClass, // Usar a turma selecionada
        };

        // Enviar requisição POST para a API
        await blocoHorarioService.create(novoBloco);
        
      } catch (error) {
        // Verificar o tipo de erro e mostrar mensagem apropriada
        let errorMessage = "Erro ao criar bloco horário.";
        
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = "Conflito de horário: Este professor já tem aula marcada neste horário ou está no horário de refeição.";
          } else if (error.response.data) {
            // Se a API retornou uma mensagem específica
            errorMessage = `Erro: ${error.response.data}`;
          }
        }
        
        setPopup({ open: true, message: errorMessage });
        return;
      }
    } else {
      setPopup({ open: true, message: "Por favor, preencha todos os campos, incluindo a turma." });
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
        setPopup({ open: true, message: "Erro ao atualizar bloco na API." });
        info.revert();
      }
    } catch (error) {
      // Verificar o tipo de erro e mostrar mensagem apropriada
      let errorMessage = "Erro ao atualizar bloco horário.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Conflito de horário: Este professor já tem aula marcada neste horário ou está no horário de refeição.";
        } else if (error.response.data) {
          // Se a API retornou uma mensagem específica
          errorMessage = `Erro: ${error.response.data}`;
        }
      }
      
      setPopup({ open: true, message: errorMessage });
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
        setPopup({ open: true, message: "Erro ao excluir bloco." });
      } else {
        // Mensagem de sucesso
        setPopup({ open: true, message: "Bloco excluído com sucesso!" });
      }
    } catch (error) {
      let errorMessage = "Erro ao excluir bloco.";
      
      if (error.response && error.response.data) {
        errorMessage = `Erro: ${error.response.data}`;
      }
      
      setPopup({ open: true, message: errorMessage });
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

  // Função utilitária para obter a semana de uma data (segunda a sábado)
  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    // getDay: 0=Dom, 1=Seg, ..., 6=Sab
    const diff = d.getDate() - (day === 0 ? 6 : day - 1); // segunda
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Função para exportar o horário para PDF
  const exportScheduleToPDF = (events) => {
    if (!events || events.length === 0) {
      alert("Não há blocos para exportar.");
      return;
    }
    // Agrupar eventos por semana
    const eventsByWeek = {};
    events.forEach((event) => {
      const weekStart = getWeekStart(event.start);
      const key = weekStart.toISOString().slice(0, 10);
      if (!eventsByWeek[key]) eventsByWeek[key] = [];
      eventsByWeek[key].push(event);
    });

    // Definir slots de 30min (08:30 a 24:00) no formato "08:30 - 09:00"
    const slotStart = 8 * 60 + 30; // 08:30 em minutos
    const slotEnd = 24 * 60; // 24:00 em minutos
    const slots = [];
    for (let min = slotStart; min < slotEnd; min += 30) {
      const h1 = Math.floor(min / 60).toString().padStart(2, "0");
      const m1 = (min % 60).toString().padStart(2, "0");
      const h2 = Math.floor((min + 30) / 60).toString().padStart(2, "0");
      const m2 = ((min + 30) % 60).toString().padStart(2, "0");
      slots.push(`${h1}:${m1} - ${h2}:${m2}`);
    }
    const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    const doc = new jsPDF();
    let firstPage = true;
    Object.entries(eventsByWeek).forEach(([weekKey, weekEvents]) => {
      if (!firstPage) doc.addPage();
      firstPage = false;
      // Cabeçalho
      doc.setFontSize(14);
      doc.text(`Horário da semana começando em ${weekKey}`, 14, 15);
      // Construir cabeçalho com dia da semana + data (ex: Seg. 19/05)
      // Corrigir: garantir que segunda-feira corresponde ao dia 19/05/2025 se weekKey for 2025-05-18 (domingo)
      // Se weekKey cair num domingo, avançar para segunda-feira
      let weekStartDateBase = new Date(weekKey);
      if (weekStartDateBase.getDay() === 0) {
        // Domingo: avançar para segunda
        weekStartDateBase.setDate(weekStartDateBase.getDate() + 1);
      }
      const weekHeader = [
        "Hora",
        ...days.map((dia, d) => {
          const date = new Date(weekStartDateBase);
          date.setDate(weekStartDateBase.getDate() + d);
          const dayNum = date.getDate().toString().padStart(2, "0");
          const monthNum = (date.getMonth() + 1).toString().padStart(2, "0");
          // Abreviação do dia da semana em pt
          const abbr = dia.slice(0, 3) + ".";
          return `${abbr} ${dayNum}/${monthNum}`;
        })
      ];
      // Nova lógica: para cada bloco da semana, coloca-o na célula correta do PDF
      // 1. Montar matriz vazia para o corpo da tabela
      const tableBody = Array(slots.length).fill(0).map(() => Array(days.length + 1).fill(""));
      // 2. Preencher coluna 0 com os horários
      for (let i = 0; i < slots.length; i++) {
        tableBody[i][0] = slots[i];
      }
      // 3. Para cada bloco, calcular a posição (linha, coluna) e o rowSpan
      weekEvents.forEach((bloco) => {
        const evStart = new Date(bloco.start);
        const evEnd = new Date(bloco.end);
        // Descobrir coluna (dia da semana)
        let weekStart = new Date(weekKey);
        if (weekStart.getDay() === 0) weekStart.setDate(weekStart.getDate() + 1); // segunda
        let col = Math.floor((evStart - weekStart) / (1000 * 60 * 60 * 24));
        if (col < 0 || col > 5) return; // fora da semana
        // Descobrir linha (slot)
        const startHour = evStart.getHours();
        const startMin = evStart.getMinutes();
        const slotIdx = slots.findIndex(s => {
          const [h, m] = s.split(" - ")[0].split(":").map(Number);
          return h === startHour && m === startMin;
        });
        if (slotIdx === -1) return; // slot não encontrado
        // Calcular rowSpan
        const duration = (evEnd - evStart) / (1000 * 60); // em minutos
        const span = Math.round(duration / 30);
        // Preencher célula
        tableBody[slotIdx][col + 1] = {
          content: `${bloco.extendedProps.subject || ""}\n${bloco.extendedProps.teacher || ""}\nSala: ${bloco.extendedProps.room || ""}`,
          rowSpan: span,
          styles: { valign: 'middle' }
        };
        // Marcar slots ocupados para não duplicar
        for (let i = 1; i < span; i++) {
          if (tableBody[slotIdx + i]) tableBody[slotIdx + i][col + 1] = null;
        }
      });
      // 4. Remover células nulas (slots ocupados por rowSpan)
      const finalBody = tableBody.map(row => row.filter(cell => cell !== null));
      autoTable(doc, {
        head: [weekHeader],
        body: finalBody,
        startY: 15,
        margin: { left: 5, right: 5 },
        styles: { cellPadding: 1, fontSize: 7, minCellHeight: 4 },
        headStyles: { fillColor: [87, 187, 76], fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 22 }, // coluna Hora
          1: { cellWidth: 27 },
          2: { cellWidth: 27 },
          3: { cellWidth: 27 },
          4: { cellWidth: 27 },
          5: { cellWidth: 27 },
          6: { cellWidth: 27 },
        },
        didDrawCell: (data) => {
          // Delimitar blocos de aula
          if (data.cell.raw && data.cell.raw !== "") {
            doc.setDrawColor(0, 128, 0);
            doc.setLineWidth(0.5);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height
            );
          }
        },
      });
    });
    doc.save("horario-semanal.pdf");
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
      // Filtrar turmas pelo curso selecionado
      setFilteredClassList(
        classList.filter(
          (turma) => String(turma.cursoFK) === String(selectedDegree)
        )
      );
    } else {
      setFilteredSubjectList(subjectList); // Mostra todos se nenhuma escola estiver selecionada
      setFilteredClassList(classList); // Mostra todas as turmas se nenhum curso estiver selecionado
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

  // Funções que permitem a repetição de semanas:
  const [visibleRange, setVisibleRange] = useState({ start: null, end: null });

  // Modify the handleDatesSet function to avoid infinite loop
  const handleDatesSet = (arg) => {
    // Only update state if the range has actually changed
    if (!visibleRange.start || !visibleRange.end ||
        visibleRange.start.getTime() !== arg.start.getTime() ||
        visibleRange.end.getTime() !== arg.end.getTime()) {
      setVisibleRange({
        start: arg.start,
        end: arg.end,
      });
    }
  };

  const repeatCurrentWeek = async () => {
    if (!visibleRange.start || !visibleRange.end) {
      alert("Semana visível não encontrada.");
      return;
    }
    // Só os eventos da semana visível
    const weekEvents = events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate >= visibleRange.start && eventDate < visibleRange.end;
    });

    if (weekEvents.length === 0) {
      alert("Não há blocos para repetir nesta semana.");
      return;
    }
    setLoading(true);
    try {
      for (const event of weekEvents) {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        startDate.setDate(startDate.getDate() + 7);
        endDate.setDate(endDate.getDate() + 7);

        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        const formatTime = (date) => {
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}:00`;
        };

        const novoBloco = {
          horaInicio: formatTime(startDate),
          horaFim: formatTime(endDate),
          dia: formatDate(startDate),
          professorFK: event.extendedProps.teacherId,
          unidadeCurricularFK: event.extendedProps.subjectId,
          salaFK: event.extendedProps.roomId,
          turmaFK: event.extendedProps.classId || 1,
        };

        await blocoHorarioService.create(novoBloco);
      }
      await fetchBlocos();
      alert("Blocos da semana visível repetidos para a próxima semana!");
    } catch (error) {
      alert("Erro ao repetir blocos.");
    } finally {
      setLoading(false);
    }
  };

  // Componente DeleteConfirmPopup para confirmação de exclusão
  const DeleteConfirmPopup = () => {
    if (!deleteConfirm.open) return null;
    
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h3>Confirmar Exclusão</h3>
          <p>Tem certeza que deseja excluir este bloco?</p>
          <div className="popup-buttons">
            <button 
              onClick={() => {
                handleDeleteEvent(deleteConfirm.eventId);
                setDeleteConfirm({ open: false, eventId: null });
              }}
              style={{
                background: "#d32f2f",
                color: "white",
                border: "none",
                padding: "8px 16px",
                margin: "0 8px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Excluir
            </button>
            <button
              onClick={() => setDeleteConfirm({ open: false, eventId: null })}
              style={{
                background: "#757575",
                color: "white",
                border: "none",
                padding: "8px 16px",
                margin: "0 8px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
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
            onClick={repeatCurrentWeek}
            disabled={loading}
          >
            Repetir Semana Visível
          </button>

          <button
            style={{
              width: "100%",
              marginBottom: 16,
              background: "#1976d2",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              border: "none",
              borderRadius: 4,
              padding: "10px 0",
              cursor: "pointer",
            }}
            onClick={() => exportScheduleToPDF(events)}
          >
            Exportar Horário para PDF
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

          {/* Novo dropdown para Turma */}
          <div className="form-group">
            <label htmlFor="selectedClass">Turma:</label>
            <select
              id="selectedClass"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={!selectedDegree}
            >
              <option value="">Selecione uma turma</option>
              {filteredClassList && filteredClassList.length > 0 ? (
                filteredClassList.map((turma) => (
                  <option key={turma.idTurma} value={turma.idTurma}>
                    {turma.nome}
                  </option>
                ))
              ) : (
                <option disabled>A carregar turmas...</option>
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
          datesSet={handleDatesSet}
          allDaySlot={false}
          events={events}
          editable={true}
          eventDrop={handleEventEdit}
          eventResize={handleEventEdit}
          dateClick={handleDateClick}
          slotDuration="00:30:00"
          slotLabelInterval="00:30:00"
          slotLabelContent={slotLabelFormatter}
          hiddenDays={[0]} /* Oculta o domingo (0 = domingo) */    
          eventDidMount={(info) => {
            info.el.addEventListener('contextmenu', (e) => {
              e.preventDefault(); // Previne o menu de contexto padrão
              setDeleteConfirm({ 
                open: true, 
                eventId: info.event.id 
              });
            });
          }}
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
      <Popup
        open={popup.open}
        message={popup.message}
        onClose={() => setPopup({ ...popup, open: false })}
      />
      <DeleteConfirmPopup />
    </div>
  );
};

export default ScheduleView;
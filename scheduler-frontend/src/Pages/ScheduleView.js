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

const ScheduleView = () => {
  const [events, setEvents] = useState([]);
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);

  // Lista - Dropdowns
  const [teacherList, setTeacherList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);

  // Função para buscar blocos horários da API e formatá-los para o FullCalendar
  // Esta função é chamada quando o componente é montado
  const fetchBlocos = async () => {
    try {
      setLoading(true);
      const response = await blocoHorarioService.getAll();

      // Converter os dados da API para o formato de eventos do FullCalendar
      const apiEvents = response.data.map((bloco) => ({
        id: bloco.idBloco,
        title: `${bloco.disciplinaNome || "Sem disciplina"} - ${
          bloco.professorNome || "Sem docente"
        } - ${bloco.salaNome || "Sem sala"}`,
        daysOfWeek: [bloco.diaSemana], // Evento recorrente semanal
        startTime: bloco.horaInicio,
        endTime: bloco.horaFim,
        startRecur: "1970-01-01",
        backgroundColor: "#57BB4C",
        borderColor: "#0d6217",
        extendedProps: {
          teacher: bloco.professorNome,
          room: bloco.salaNome,
          subject: bloco.disciplinaNome,
          class: bloco.turmaNome,
          typology: bloco.tipologia,
        },
      }));
      setEvents(apiEvents);
    } catch (error) {
      alert("Erro ao carregar blocos horários.");
    } finally {
      setLoading(false);
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

  // Disciplinas
  const fetchDisciplinas = async () => {
    try {
      const response = await ucService.getAll();
      const ucs = response.data
        .map((ucs) => ({
          idDisciplina: ucs.idDisciplina,
          nomeDisciplina: ucs.nomeDisciplina,
        }))
        .sort((a, b) => a.id - b.id); // Ordenar por id de forma crescente
      setSubjectList(ucs);
      console.log(ucs);
    } catch (error) {
      console.error("Erro ao buscar salas:", error);
      return [];
    }
  };

  // Carregar blocos e as dropdowns quando o componente montar
  useEffect(() => {
    fetchBlocos();
    fetchProfessores();
    fetchSalas();
    fetchDisciplinas();
  }, []);

  const handleDateClick = (info) => {
    // aceitar criação de blocos apenas se todos os campos estiverem preenchidos
    if (teacher && room && subject) {
      // criar um horário de início corretamente alinhado a partir da data clicada
      const clickTime = new Date(info.dateStr);

      // criar um horário de fim 2 horas após o horário de início
      const endTime = new Date(clickTime);
      endTime.setHours(endTime.getHours() + 2);

      const newEvent = {
        id: Date.now(),
        title: `${subject} - ${teacher} - ${room}`,
        start: clickTime,
        end: endTime,
        extendedProps: {
          teacher,
          room,
          subject,
        },
        backgroundColor: "#57BB4C",
        borderColor: "#0d6217",
      };

      setEvents([...events, newEvent]);
    } else {
      alert("Por favor, preencha todos os campos antes de criar um bloco");
    }
  };

  const handleEventDrop = (info) => {
    const updatedEvents = events.map((event) => {
      if (event.id === parseInt(info.event.id)) {
        return {
          ...event,
          start: info.event.start,
          end: info.event.end,
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleEventResize = (info) => {
    const updatedEvents = events.map((event) => {
      if (event.id === parseInt(info.event.id)) {
        return {
          ...event,
          start: info.event.start,
          end: info.event.end,
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    );
  };

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

  return (
    <div className="container">
      <div className="SideBar">
        <h2>Criar Bloco</h2>
        <div className="form-group">
          <label htmlFor="teacher">Professor:</label>
          <select
            id="teacher"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
          >
            <option value="">Selecione um professor</option>
            {teacherList && teacherList.length > 0 ? (
              teacherList.map((prof) => (
                <option key={prof.idUtilizador} value={prof.nome}>
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
          >
            <option value="">Selecione uma sala</option>
            {roomList && roomList.length > 0 ? (
              roomList.map((room) => (
                <option key={room.idSala} value={room.nome}>
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
          >
            <option value="">Selecione uma Unidade Curricular</option>
            {subjectList && subjectList.length > 0 ? (
              subjectList.map((subject) => (
                <option key={subject.idDisciplina} value={subject.nomeDisciplina}>
                  {subject.nomeDisciplina}
                </option>
              ))
            ) : (
              <option disabled>A carregar UCs...</option>
            )}
          </select>
        </div>

        <div className="blocks-preview">
          <h3>Blocos Atuais</h3>
          <p className="instructions">
            Preencha os campos acima e clique no calendário para criar um bloco
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
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
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

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt"; // Importar a localização em português
import "../Styles/ScheduleView.css";
import blocoHorarioService from "../services/blocoHorarioService"; // Importar o serviço de blocos horários
import { useEffect } from "react";

const ScheduleView = () => {
  const [events, setEvents] = useState([]);
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);

  // Função para buscar blocos horários da API e formatá-los para o FullCalendar
  // Esta função é chamada quando o componente é montado
  const fetchBlocos = async () => {
    try {
      setLoading(true);
      const response = await blocoHorarioService.getAll();
  
      // Converter os dados da API para o formato de eventos do FullCalendar
      const apiEvents = response.data.map(bloco => ({
        id: bloco.idBloco,
        title: `${bloco.disciplinaNome || 'Sem disciplina'} - ${bloco.professorNome || 'Sem docente'} - ${bloco.salaNome || 'Sem sala'}`,
        daysOfWeek: [bloco.diaSemana], // Evento recorrente semanal
        startTime: bloco.horaInicio,   // Ex: "08:30:00"
        endTime: bloco.horaFim,        // Ex: "10:30:00"
        startRecur: "1970-01-01",
        backgroundColor: '#57BB4C',
        borderColor: '#0d6217',
        extendedProps: {
          teacher: bloco.professorNome,
          room: bloco.salaNome,
          subject: bloco.disciplinaNome,
          class: bloco.turmaNome,
          typology: bloco.tipologia
        }
      }));
      setEvents(apiEvents);
    } catch (error) {
      alert('Erro ao carregar blocos horários.');
    } finally {
      setLoading(false);
    }
  };
  

  // Carregar blocos quando o componente montar
  useEffect(() => {
    fetchBlocos();
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
          <input
            type="text"
            id="teacher"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="Introduza o nome do professor"
          />
        </div>
        <div className="form-group">
          <label htmlFor="room">Sala:</label>
          <input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Introduza o número da sala"
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject">Disciplina:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Introduza o nome da disciplina"
          />
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

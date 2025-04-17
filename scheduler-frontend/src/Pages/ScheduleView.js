import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../Styles/ScheduleView.css";

function ScheduleView() {
    const [events, setEvents] = useState([]);

    const [professor, setProfessor] = useState("");
    const [sala, setSala] = useState("");
    const [disciplina, setDisciplina] = useState("");

    const addTestBlock = () => {
        if (!disciplina || !professor || !sala) return;

        const newEvent = {
            title: `${disciplina} - ${professor} (${sala})`,
            start: "2025-04-17T09:30:00", // Data e hora de início
            end: "2025-04-17T12:00:00",   // Data e hora de fim
        };

        setEvents([...events, newEvent]);
    };

    return (
        <div className="container">
            <div className="ScheduleView">
                <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    locale="pt"
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev',
                        center: 'title',
                        right: 'next'
                    }}
                    allDaySlot={false}
                    slotMinTime="08:30:00"
                    slotMaxTime="24:00:00"
                    editable={true}
                    droppable={true}
                    events={events}
                    eventDrop={(info) => {
                        // Atualiza evento ao mover
                        const updatedEvents = events.map(evt =>
                            evt === info.event._def.extendedProps.ref ? {
                                ...evt,
                                start: info.event.start,
                                end: info.event.end
                            } : evt
                        );
                        setEvents(updatedEvents);
                    }}
                    hiddenDays={[0]} // Esconde o domingo (0 é o índice do domingo)
                    
                />
            </div>

            <div className="SideBar">
                <input
                    type="text"
                    placeholder="Professor"
                    value={professor}
                    onChange={(e) => setProfessor(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Sala"
                    value={sala}
                    onChange={(e) => setSala(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Disciplina"
                    value={disciplina}
                    onChange={(e) => setDisciplina(e.target.value)}
                />
                <button onClick={addTestBlock}>Adicionar Bloco de Teste</button>
            </div>
        </div>
    );
}

export default ScheduleView;

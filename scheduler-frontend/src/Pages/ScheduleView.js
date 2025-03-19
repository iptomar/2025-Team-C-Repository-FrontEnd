import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend"; 
import '../Styles/ScheduleView.css'; 
import Block from "../Components/Block"; 
import Cell from "../Components/Cell";

function ScheduleView() {
    // Criar os slots de 30 em 30 minutos, das 08:30 até às 24:00
    const timeSlots = [];
    // Loop para gerar os slots de tempo
    // Começa às 08:00 e termina às 24:00
    for (let hour = 8; hour < 24; hour++) {

        // Ciclo interno para alternar entre os minutos ":00" e ":30" para criar intervalos de 30 minutos
        for (let min of ["00", "30"]) { 
            let nextHour = hour; // Inicialmente, a próxima hora é igual à atual
            let nextMin = min === "00" ? "30" : "00"; // Se os minutos forem "00", os próximos serão "30", e vice-versa
            
            // Se estamos a gerar o intervalo "XX:30 - XX:00", precisamos avançar a hora
            if (min === "30") {
                nextHour = hour + 1;
            }
    
            // Adicionamos ao array um intervalo no formato "HH:MM - HH:MM"
            timeSlots.push(`${hour.toString().padStart(2, '0')}:${min} - ${nextHour.toString().padStart(2, '0')}:${nextMin}`);
        }
    }
    
    // Estado do horário (inicialmente vazio)
    const [schedule, setSchedule] = useState(
        Object.fromEntries(
            ["segunda", "terça", "quarta", "quinta", "sexta", "sábado"].map(day => [day, new Array(timeSlots.length).fill("")])
        )
    );

    // Função para mover um bloco de um local para outro na tabela
    const moveBlock = (fromDay, fromIndex, toDay, toIndex) => {
        const updatedSchedule = { ...schedule }; // Copia o estado atual
        const [movedBlock] = updatedSchedule[fromDay].splice(fromIndex, 1, ""); // Remove o bloco da posição original
        updatedSchedule[toDay].splice(toIndex, 1, movedBlock); // Adiciona o bloco à nova posição
        setSchedule(updatedSchedule); // Atualiza o estado com o novo horário
    };

    // FUNÇÃO PARA ADICIONAR UM BLOCO DE TESTE (TEMPORARIO)
    const addTestBlock = () => {
        const updatedSchedule = { ...schedule };
        updatedSchedule["segunda"][2] = "Novo Bloco de Teste"; // Adiciona o bloco na segunda-feira às 09:30 - 10:00
        setSchedule(updatedSchedule);
    };
    

    return (
        // Ativa o contexto Drag & Drop para os componentes filhos
        <DndProvider backend={HTML5Backend}>
            <div className="ScheduleView">
            <button onClick={addTestBlock}>Adicionar Bloco de Teste</button>
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Segunda</th>
                            <th>Terça</th>
                            <th>Quarta</th>
                            <th>Quinta</th>
                            <th>Sexta</th>
                            <th>Sábado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Gera as linhas da tabela com os horários */}
                        {timeSlots.map((time, rowIndex) => (
                            <tr key={rowIndex}>
                                <td>{time}</td> {/* Mostra o intervalo de tempo */}
                                {/* Gera as células da tabela para cada dia da semana */}
                                {Object.keys(schedule).map((day) => (
                                    <Cell 
                                        key={day} 
                                        day={day} 
                                        rowIndex={rowIndex} 
                                        block={schedule[day][rowIndex]} 
                                        moveBlock={moveBlock} 
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DndProvider>
    );
}

export default ScheduleView; 

import { useDrop } from "react-dnd"; // Importa o hook useDrop da biblioteca react-dnd
import Block from "./Block"; // Importa o componente Block para renderizar dentro da célula

// Definição do componente Cell
const Cell = ({ day, rowIndex, block, moveBlock }) => {
    
    // Configuração da área onde os blocos podem ser largados (drop)
    const [, drop] = useDrop({
        accept: "BLOCK", // Define que esta célula aceita elementos do tipo "BLOCK"
        drop: (draggedItem) => { // Função chamada quando um bloco é largado nesta célula
            moveBlock(draggedItem.day, draggedItem.index, day, rowIndex); // Move o bloco para a nova posição
        },
    });

    return (
        <td ref={drop} className="schedule-cell"> 
            {/* Define esta célula como um local onde blocos podem ser largados */}
            
            {block && ( // Se existir um bloco nesta célula, renderiza-o
                <Block block={block} day={day} index={rowIndex} moveBlock={moveBlock} />
            )}
        </td>
    );
};

export default Cell;

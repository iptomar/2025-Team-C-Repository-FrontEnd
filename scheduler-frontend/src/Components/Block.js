import { useDrag } from "react-dnd"; // Importa o hook useDrag da biblioteca react-dnd

const ItemType = "BLOCK"; // Define um tipo para os itens arrastáveis

// Definição do componente Block
const Block = ({ block, day, index, moveBlock }) => {
    
    // Configuração do arrastar (drag)
    const [{ isDragging }, drag] = useDrag({
        type: ItemType, 
        item: { day, index }, // Informação que é passada quando o item é arrastado
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(), // Verifica se o bloco está a ser arrastado
        }),
    });

    return (
        <div
            ref={drag} // Associa a referência do hook useDrag a este elemento para que possa ser arrastado
            className="schedule-block" // Classe CSS para estilizar o bloco
            style={{ opacity: isDragging ? 0.5 : 1 }} // Se estiver a ser arrastado, reduz a opacidade para dar feedback visual
        >
            {block} {/* Mostra o nome ou conteúdo do bloco */}
        </div>
    );
};

export default Block;

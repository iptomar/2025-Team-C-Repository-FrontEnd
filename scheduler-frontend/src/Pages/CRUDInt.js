import React, { useState } from "react";

function CRUDInt() {
  // Estados para armazenar os dados
  const [professores, setProfessores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [salas, setSalas] = useState([]);

  // Estados para os inputs
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(null); // Índice do item a ser editado
  const [editType, setEditType] = useState(""); // Tipo do item a ser editado

  // Função para adicionar ou editar um item
  const handleAddOrEdit = (type) => {
    if (input.trim() === "") return;

    if (editIndex !== null) {
      // Editar item existente
      switch (type) {
        case "professores":
          const updatedProfessores = [...professores];
          updatedProfessores[editIndex] = input;
          setProfessores(updatedProfessores);
          break;
        case "disciplinas":
          const updatedDisciplinas = [...disciplinas];
          updatedDisciplinas[editIndex] = input;
          setDisciplinas(updatedDisciplinas);
          break;
        case "turmas":
          const updatedTurmas = [...turmas];
          updatedTurmas[editIndex] = input;
          setTurmas(updatedTurmas);
          break;
        case "salas":
          const updatedSalas = [...salas];
          updatedSalas[editIndex] = input;
          setSalas(updatedSalas);
          break;
        default:
          break;
      }
      setEditIndex(null); // Limpar o índice de edição
      setEditType(""); // Limpar o tipo de edição
    } else {
      // Adicionar novo item
      switch (type) {
        case "professores":
          setProfessores([...professores, input]);
          break;
        case "disciplinas":
          setDisciplinas([...disciplinas, input]);
          break;
        case "turmas":
          setTurmas([...turmas, input]);
          break;
        case "salas":
          setSalas([...salas, input]);
          break;
        default:
          break;
      }
    }
    setInput(""); // Limpar o campo de input
  };

  // Função para remover um item
  const handleRemove = (type, index) => {
    switch (type) {
      case "professores":
        setProfessores(professores.filter((_, i) => i !== index));
        break;
      case "disciplinas":
        setDisciplinas(disciplinas.filter((_, i) => i !== index));
        break;
      case "turmas":
        setTurmas(turmas.filter((_, i) => i !== index));
        break;
      case "salas":
        setSalas(salas.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  };

  // Função para carregar um item no campo de input para edição
  const handleEdit = (type, index) => {
    switch (type) {
      case "professores":
        setInput(professores[index]);
        break;
      case "disciplinas":
        setInput(disciplinas[index]);
        break;
      case "turmas":
        setInput(turmas[index]);
        break;
      case "salas":
        setInput(salas[index]);
        break;
      default:
        break;
    }
    setEditIndex(index); // Definir o índice do item a ser editado
    setEditType(type); // Definir o tipo do item a ser editado
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestão de Professores, Disciplinas, Turmas e Salas</h1>

      {/* Campo de input */}
      <input
        type="text"
        placeholder="Adicionar ou editar item"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      />

      {/* Botões para adicionar ou editar itens */}
      <button onClick={() => handleAddOrEdit(editType || "professores")}>
        {editIndex !== null ? "Editar Professor" : "Adicionar Professor"}
      </button>
      <button onClick={() => handleAddOrEdit(editType || "disciplinas")}>
        {editIndex !== null ? "Editar Disciplina" : "Adicionar Disciplina"}
      </button>
      <button onClick={() => handleAddOrEdit(editType || "turmas")}>
        {editIndex !== null ? "Editar Turma" : "Adicionar Turma"}
      </button>
      <button onClick={() => handleAddOrEdit(editType || "salas")}>
        {editIndex !== null ? "Editar Sala" : "Adicionar Sala"}
      </button>

      {/* Listas de itens */}
      <div style={{ marginTop: "20px" }}>
        <h2>Professores</h2>
        <ul>
          {professores.map((professor, index) => (
            <li key={index}>
              {professor}{" "}
              <button onClick={() => handleEdit("professores", index)}>Editar</button>
              <button onClick={() => handleRemove("professores", index)}>Remover</button>
            </li>
          ))}
        </ul>

        <h2>Disciplinas</h2>
        <ul>
          {disciplinas.map((disciplina, index) => (
            <li key={index}>
              {disciplina}{" "}
              <button onClick={() => handleEdit("disciplinas", index)}>Editar</button>
              <button onClick={() => handleRemove("disciplinas", index)}>Remover</button>
            </li>
          ))}
        </ul>

        <h2>Turmas</h2>
        <ul>
          {turmas.map((turma, index) => (
            <li key={index}>
              {turma}{" "}
              <button onClick={() => handleEdit("turmas", index)}>Editar</button>
              <button onClick={() => handleRemove("turmas", index)}>Remover</button>
            </li>
          ))}
        </ul>

        <h2>Salas</h2>
        <ul>
          {salas.map((sala, index) => (
            <li key={index}>
              {sala}{" "}
              <button onClick={() => handleEdit("salas", index)}>Editar</button>
              <button onClick={() => handleRemove("salas", index)}>Remover</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CRUDInt;
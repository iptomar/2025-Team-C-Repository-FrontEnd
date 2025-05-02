import React, { useState } from "react";
import "../Styles/CRUDInt.css";

function CRUDInt() {
  // Estados para armazenar os dados
  const [professores, setProfessores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [salas, setSalas] = useState([]);

  // Estados para os inputs e seleção
  const [input, setInput] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // Índice do item selecionado
  const [selectedType, setSelectedType] = useState("professores"); // Definir professores como categoria padrão

  // Função para adicionar ou editar um item
  const handleAddOrEdit = () => {
    if (input.trim() === "") return;

    if (selectedItem !== null) {
      // Editar item existente
      switch (selectedType) {
        case "professores":
          const updatedProfessores = [...professores];
          updatedProfessores[selectedItem] = input;
          setProfessores(updatedProfessores);
          break;
        case "disciplinas":
          const updatedDisciplinas = [...disciplinas];
          updatedDisciplinas[selectedItem] = input;
          setDisciplinas(updatedDisciplinas);
          break;
        case "turmas":
          const updatedTurmas = [...turmas];
          updatedTurmas[selectedItem] = input;
          setTurmas(updatedTurmas);
          break;
        case "salas":
          const updatedSalas = [...salas];
          updatedSalas[selectedItem] = input;
          setSalas(updatedSalas);
          break;
        default:
          break;
      }
      setSelectedItem(null); // Limpar seleção
    } else {
      // Adicionar novo item
      switch (selectedType) {
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
  const handleRemove = () => {
    if (selectedItem === null) return;

    switch (selectedType) {
      case "professores":
        setProfessores(professores.filter((_, i) => i !== selectedItem));
        break;
      case "disciplinas":
        setDisciplinas(disciplinas.filter((_, i) => i !== selectedItem));
        break;
      case "turmas":
        setTurmas(turmas.filter((_, i) => i !== selectedItem));
        break;
      case "salas":
        setSalas(salas.filter((_, i) => i !== selectedItem));
        break;
      default:
        break;
    }
    setSelectedItem(null);
  };

  // Função para selecionar um item
  const handleSelect = (type, index) => {
    setSelectedItem(index);
    setSelectedType(type);
    setInput(
      type === "professores"
        ? professores[index]
        : type === "disciplinas"
        ? disciplinas[index]
        : type === "turmas"
        ? turmas[index]
        : salas[index]
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestão de Professores, Disciplinas, Turmas e Salas</h1>

      {/* Botões para selecionar a secção com a classe category-buttons */}
      <div className="category-buttons">
        <button 
          className={`category-button ${selectedType === "professores" ? "selected" : ""}`}
          onClick={() => setSelectedType("professores")}
        >
          Professores
        </button>
        <button 
          className={`category-button ${selectedType === "disciplinas" ? "selected" : ""}`}
          onClick={() => setSelectedType("disciplinas")}
        >
          Disciplinas
        </button>
        <button 
          className={`category-button ${selectedType === "turmas" ? "selected" : ""}`}
          onClick={() => setSelectedType("turmas")}
        >
          Turmas
        </button>
        <button 
          className={`category-button ${selectedType === "salas" ? "selected" : ""}`}
          onClick={() => setSelectedType("salas")}
        >
          Salas
        </button>
      </div>

      {/* Campo de input */}
      <input
        type="text"
        placeholder="Adicionar ou editar item"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      />

      {/* Botões globais */}
      <button onClick={handleAddOrEdit}>
        {selectedItem !== null ? "Editar Item" : "Adicionar Item"}
      </button>
      <button onClick={handleRemove} disabled={selectedItem === null}>
        Remover Item
      </button>

      {/* Listas de itens */}
      <div style={{ marginTop: "20px" }}>
        <h2>Professores</h2>
        <ul className="scrollable-list">
          {professores.map((professor, index) => (
            <li
              key={index}
              onClick={() => handleSelect("professores", index)}
              className={selectedItem === index && selectedType === "professores" ? "selected" : ""}
            >
              {professor}
            </li>
          ))}
        </ul>

        <h2>Disciplinas</h2>
        <ul className="scrollable-list">
          {disciplinas.map((disciplina, index) => (
            <li
              key={index}
              onClick={() => handleSelect("disciplinas", index)}
              className={selectedItem === index && selectedType === "disciplinas" ? "selected" : ""}
            >
              {disciplina}
            </li>
          ))}
        </ul>

        <h2>Turmas</h2>
        <ul className="scrollable-list">
          {turmas.map((turma, index) => (
            <li
              key={index}
              onClick={() => handleSelect("turmas", index)}
              className={selectedItem === index && selectedType === "turmas" ? "selected" : ""}
            >
              {turma}
            </li>
          ))}
        </ul>

        <h2>Salas</h2>
        <ul className="scrollable-list">
          {salas.map((sala, index) => (
            <li
              key={index}
              onClick={() => handleSelect("salas", index)}
              className={selectedItem === index && selectedType === "salas" ? "selected" : ""}
            >
              {sala}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CRUDInt;
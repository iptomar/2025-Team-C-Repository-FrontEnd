import React, { useState, useEffect } from "react";
import "../Styles/CRUDInt.css";

// Importar os serviços de API
import turmaService from "../services/turmaService";
import salaService from "../services/salaService";
import ucService from "../services/ucService"; // Para disciplinas
import api from "../services/api"; // Para requisições diretas se necessário

function CRUDInt() {
  // Estados para armazenar os dados
  const [professores, setProfessores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [salas, setSalas] = useState([]);
  
  // Estado para controlar carregamento
  const [loading, setLoading] = useState({
    professores: false,
    disciplinas: false,
    turmas: false,
    salas: false
  });
  
  // Estado para mensagens de erro
  const [error, setError] = useState(null);

  // Estados para os inputs e seleção
  const [input, setInput] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState("professores");


  useEffect(() => {
    fetchData();
  }, []);

  // Função para buscar todos os dados da API
  const fetchData = async () => {
    try {
      // Carregar dados de professores
      setLoading(prev => ({ ...prev, professores: true }));
      
      setLoading(prev => ({ ...prev, professores: false }));

      // Carregar disciplinas (UCs)
      setLoading(prev => ({ ...prev, disciplinas: true }));
      const disciplinasResponse = await ucService.getAll();
      console.log("Disciplinas carregadas:", disciplinasResponse.data);
      setDisciplinas(disciplinasResponse.data);
      setLoading(prev => ({ ...prev, disciplinas: false }));

      // Carregar turmas
      setLoading(prev => ({ ...prev, turmas: true }));
      const turmasResponse = await turmaService.getAll();
      setTurmas(turmasResponse.data);
      setLoading(prev => ({ ...prev, turmas: false }));

      // Carregar salas
      setLoading(prev => ({ ...prev, salas: true }));
      const salasResponse = await salaService.getAll();
      setSalas(salasResponse.data);
      setLoading(prev => ({ ...prev, salas: false }));

    } catch (err) {
      setError("Erro ao carregar dados da API: " + err.message);
      console.error("Erro ao carregar dados:", err);
      setLoading({
        professores: false,
        disciplinas: false,
        turmas: false,
        salas: false
      });
    }
  };

  // Função para adicionar ou editar um item
  const handleAddOrEdit = async () => {
    if (input.trim() === "") return;

    try {
      if (selectedItem !== null) {
        // Editar item existente
        switch (selectedType) {
          case "professores":
            const updatedProfessores = [...professores];
            updatedProfessores[selectedItem] = input;
            setProfessores(updatedProfessores);
            break;
            
          case "disciplinas":
            const disciplina = disciplinas[selectedItem];
            const updatedDisciplina = { ...disciplina, nome: input };
            await ucService.update(disciplina.id, updatedDisciplina);
            
            // Recarregar disciplinas após atualização
            const disciplinasResponse = await ucService.getAll();
            setDisciplinas(disciplinasResponse.data);
            break;
            
          case "turmas":
            const turma = turmas[selectedItem];
            const updatedTurma = { ...turma, nome: input };
            await turmaService.update(turma.id, updatedTurma);
            
            // Recarregar turmas após atualização
            const turmasResponse = await turmaService.getAll();
            setTurmas(turmasResponse.data);
            break;
            
          case "salas":
            const sala = salas[selectedItem];
            const updatedSala = { ...sala, nome: input };
            await salaService.update(sala.id, updatedSala);
            
            // Recarregar salas após atualização
            const salasResponse = await salaService.getAll();
            setSalas(salasResponse.data);
            break;
            
          default:
            break;
        }
      } else {
        // Adicionar novo item
        switch (selectedType) {
          case "professores":
            setProfessores([...professores, input]);
            break;
            
          case "disciplinas":
            // Criando uma nova disciplina (UC)
            const newDisciplina = { nome: input };
            await ucService.create(newDisciplina);
            
            // Recarregar disciplinas após adição
            const disciplinasResponse = await ucService.getAll();
            setDisciplinas(disciplinasResponse.data);
            break;
            
          case "turmas":
            const newTurma = { nome: input };
            await turmaService.create(newTurma);
            
            // Recarregar turmas após adição
            const turmasResponse = await turmaService.getAll();
            setTurmas(turmasResponse.data);
            break;
            
          case "salas":
            const newSala = { nome: input };
            await salaService.create(newSala);
            
            // Recarregar salas após adição
            const salasResponse = await salaService.getAll();
            setSalas(salasResponse.data);
            break;
            
          default:
            break;
        }
      }
      
      setInput(""); // Limpar o campo de input
      setSelectedItem(null); // Limpar seleção
      setError(null); // Limpar mensagens de erro
      
    } catch (err) {
      setError(`Erro ao ${selectedItem !== null ? 'editar' : 'adicionar'} ${selectedType}: ${err.message}`);
      console.error("Erro na operação:", err);
    }
  };

  // Função para remover um item
  const handleRemove = async () => {
    if (selectedItem === null) return;

    try {
      switch (selectedType) {
        case "professores":
          setProfessores(professores.filter((_, i) => i !== selectedItem));
          break;
          
        case "disciplinas":
          const disciplina = disciplinas[selectedItem];
          await ucService.delete(disciplina.id);
          
          // Recarregar disciplinas após eliminacao
          const disciplinasResponse = await ucService.getAll();
          setDisciplinas(disciplinasResponse.data);
          break;
          
        case "turmas":
          const turma = turmas[selectedItem];
          await turmaService.delete(turma.id);
          
          // Recarregar turmas após eliminacao
          const turmasResponse = await turmaService.getAll();
          setTurmas(turmasResponse.data);
          break;
          
        case "salas":
          const sala = salas[selectedItem];
          await salaService.delete(sala.id);
          
          // Recarregar salas após eliminacao
          const salasResponse = await salaService.getAll();
          setSalas(salasResponse.data);
          break;
          
        default:
          break;
      }
      
      setSelectedItem(null);
      setError(null); // Limpar mensagens de erro
      
    } catch (err) {
      setError(`Erro ao remover ${selectedType}: ${err.message}`);
      console.error("Erro ao remover:", err);
    }
  };

  // Função para selecionar um item
  const handleSelect = (type, index) => {
  setSelectedItem(index);
  setSelectedType(type);

  switch(type) {
    case "professores":
      setInput(professores[index].toString());
      break;
    case "disciplinas":
      setInput(disciplinas[index].nomeDisciplina || "");
      break;
    case "turmas":
      const turma = turmas[index];
      const turmaText = turma.nome || turma.titulo || turma.descricao || turma.id || 'Item sem nome';
      setInput(turmaText.toString());
      break;
    case "salas":
      const sala = salas[index];
      const salaText = sala.nome || sala.titulo || sala.descricao || sala.id || 'Item sem nome';
      setInput(salaText.toString());
      break;
    default:
      break;
  }
};


  // Função para renderizar uma lista com tratamento de objetos
const renderList = (items, type) => {
  return items.map((item, index) => {
    let displayText = 'Item sem nome';
    
    if (typeof item === 'string') {
      displayText = item;
    } else {
      switch (type) {
        case 'disciplinas':
          displayText = item.nomeDisciplina || `ID: ${item.idDisciplina}`;
          break;
        case 'professores':
          displayText = item.nome || item.id || 'Item sem nome';
          break;
        case 'turmas':
          displayText = item.nome || item.id || 'Item sem nome';
          break;
        case 'salas':
          displayText = item.nome || item.id || 'Item sem nome';
          break;
        default:
          displayText = item.nome || item.id || 'Item sem nome';
      }
    }

    return (
      <li
        key={index}
        onClick={() => handleSelect(type, index)}
        className={selectedItem === index && selectedType === type ? "selected" : ""}
      >
        {displayText}
      </li>
    );
  });
};


  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestão de Professores, Disciplinas, Turmas e Salas</h1>

      {/* Mensagem de erro */}
      {error && <div className="error-message">{error}</div>}

      {/* Botões para selecionar a secção */}
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
      <div className="action-buttons-container">
        <button className="action-button" onClick={handleAddOrEdit}>
          {selectedItem !== null ? "Editar" : "Adicionar"}
        </button>
        <button className="action-button" onClick={handleRemove} disabled={selectedItem === null}>
          Remover
        </button>
        <button className="action-button" onClick={fetchData}>
          Recarregar
        </button>
      </div>

      {/* Listas de itens com indicadores de carregamento */}
      <div style={{ marginTop: "20px" }}>
        <h2>Professores</h2>
        <ul className="scrollable-list">
          {loading.professores ? (
            <li>Carregando professores...</li>
          ) : professores.length > 0 ? (
            renderList(professores, "professores")
          ) : (
            <li>Nenhum professor cadastrado</li>
          )}
        </ul>

        <h2>Disciplinas</h2>
        <ul className="scrollable-list">
          {loading.disciplinas ? (
            <li>Carregando disciplinas...</li>
          ) : disciplinas.length > 0 ? (
            renderList(disciplinas, "disciplinas")
          ) : (
            <li>Nenhuma disciplina cadastrada</li>
          )}
        </ul>

        <h2>Turmas</h2>
        <ul className="scrollable-list">
          {loading.turmas ? (
            <li>Carregando turmas...</li>
          ) : turmas.length > 0 ? (
            renderList(turmas, "turmas")
          ) : (
            <li>Nenhuma turma cadastrada</li>
          )}
        </ul>

        <h2>Salas</h2>
        <ul className="scrollable-list">
          {loading.salas ? (
            <li>Carregando salas...</li>
          ) : salas.length > 0 ? (
            renderList(salas, "salas")
          ) : (
            <li>Nenhuma sala cadastrada</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default CRUDInt;
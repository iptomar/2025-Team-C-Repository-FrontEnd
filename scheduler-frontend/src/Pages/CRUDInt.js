import React, { useState, useEffect } from "react";
import "../Styles/CRUDInt.css";

// Importar os serviços de API
import turmaService from "../services/turmaService";
import salaService from "../services/salaService";
import ucService from "../services/ucService"; // Para disciplinas
import api from "../services/api"; // Para requisições diretas se necessário

// Dados mock para quando a API não está disponível
const mockData = {
  professores: [
    { id: 1, nome: "João Silva" },
    { id: 2, nome: "Maria Oliveira" },
    { id: 3, nome: "Carlos Santos" }
  ],
  disciplinas: [
    { idUC: 1, nomeUC: "Matemática" },
    { idUC: 2, nomeUC: "Programação" },
    { idUC: 3, nomeUC: "Física" }
  ],
  turmas: [
    { idTurma: 1, nome: "Turma A" },
    { idTurma: 2, nome: "Turma B" },
    { idTurma: 3, nome: "Turma C" }
  ],
  salas: [
    { idSala: 1, nome: "Sala 101" },
    { idSala: 2, nome: "Sala 102" },
    { idSala: 3, nome: "Laboratório 1" }
  ]
};

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
  
  // Flag para usar dados mock quando a API falha
  const [useMockData, setUseMockData] = useState(false);

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
      // Como não temos um endpoint para professores, usamos os dados mock
      setProfessores(mockData.professores);
      setLoading(prev => ({ ...prev, professores: false }));

      try {
        // Tentamos carregar disciplinas da API
        setLoading(prev => ({ ...prev, disciplinas: true }));
        const disciplinasResponse = await ucService.getAll();
        setDisciplinas(disciplinasResponse.data);
        setLoading(prev => ({ ...prev, disciplinas: false }));
      } catch (err) {
        console.log("Usando dados mock para disciplinas:", err.message);
        setDisciplinas(mockData.disciplinas);
        setLoading(prev => ({ ...prev, disciplinas: false }));
        setUseMockData(true);
      }

      try {
        // Tentamos carregar turmas da API
        setLoading(prev => ({ ...prev, turmas: true }));
        const turmasResponse = await turmaService.getAll();
        setTurmas(turmasResponse.data);
        setLoading(prev => ({ ...prev, turmas: false }));
      } catch (err) {
        console.log("Usando dados mock para turmas:", err.message);
        setTurmas(mockData.turmas);
        setLoading(prev => ({ ...prev, turmas: false }));
        setUseMockData(true);
      }

      try {
        // Tentamos carregar salas da API
        setLoading(prev => ({ ...prev, salas: true }));
        const salasResponse = await salaService.getAll();
        setSalas(salasResponse.data);
        setLoading(prev => ({ ...prev, salas: false }));
      } catch (err) {
        console.log("Usando dados mock para salas:", err.message);
        setSalas(mockData.salas);
        setLoading(prev => ({ ...prev, salas: false }));
        setUseMockData(true);
      }

      // Se algum carregamento falhou, mostra alerta
      if (useMockData) {
        setError("API indisponível. Usando dados mock para demonstração.");
      } else {
        setError(null);
      }
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
      console.error("Erro ao carregar dados:", err);
      
      // Usar dados mock se a API falhar
      setProfessores(mockData.professores);
      setDisciplinas(mockData.disciplinas);
      setTurmas(mockData.turmas);
      setSalas(mockData.salas);
      setUseMockData(true);
      
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
            // Como não temos API para professores, atualizamos só na memória
            const updatedProfessores = [...professores];
            updatedProfessores[selectedItem] = { 
              ...professores[selectedItem], 
              nome: input 
            };
            setProfessores(updatedProfessores);
            break;
            
          case "disciplinas":
            if (useMockData) {
              const updatedDisciplinas = [...disciplinas];
              updatedDisciplinas[selectedItem] = { 
                ...disciplinas[selectedItem], 
                nomeUC: input 
              };
              setDisciplinas(updatedDisciplinas);
            } else {
              const disciplina = disciplinas[selectedItem];
              const id = disciplina.idUC || disciplina.IdUC;
              const updatedDisciplina = { 
                ...disciplina, 
                nomeUC: input,
                NomeUC: input // Para compatibilidade com diferentes propriedades
              };
              await ucService.update(id, updatedDisciplina);
              const disciplinasResponse = await ucService.getAll();
              setDisciplinas(disciplinasResponse.data);
            }
            break;
            
          case "turmas":
            if (useMockData) {
              const updatedTurmas = [...turmas];
              updatedTurmas[selectedItem] = { 
                ...turmas[selectedItem], 
                nome: input 
              };
              setTurmas(updatedTurmas);
            } else {
              const turma = turmas[selectedItem];
              const id = turma.idTurma || turma.id;
              const updatedTurma = { ...turma, nome: input };
              await turmaService.update(id, updatedTurma);
              const turmasResponse = await turmaService.getAll();
              setTurmas(turmasResponse.data);
            }
            break;
            
          case "salas":
            if (useMockData) {
              const updatedSalas = [...salas];
              updatedSalas[selectedItem] = { 
                ...salas[selectedItem], 
                nome: input 
              };
              setSalas(updatedSalas);
            } else {
              const sala = salas[selectedItem];
              const id = sala.idSala || sala.id;
              const updatedSala = { ...sala, nome: input };
              await salaService.update(id, updatedSala);
              const salasResponse = await salaService.getAll();
              setSalas(salasResponse.data);
            }
            break;
            
          default:
            break;
        }
      } else {
        // Adicionar novo item
        switch (selectedType) {
          case "professores":
            const newProfessor = { 
              id: professores.length + 1, 
              nome: input 
            };
            setProfessores([...professores, newProfessor]);
            break;
            
          case "disciplinas":
            if (useMockData) {
              const newDisciplina = { 
                idUC: disciplinas.length + 1, 
                nomeUC: input 
              };
              setDisciplinas([...disciplinas, newDisciplina]);
            } else {
              const newDisciplina = { nome: input };
              await ucService.create(newDisciplina);
              const disciplinasResponse = await ucService.getAll();
              setDisciplinas(disciplinasResponse.data);
            }
            break;
            
          case "turmas":
            if (useMockData) {
              const newTurma = { 
                idTurma: turmas.length + 1, 
                nome: input 
              };
              setTurmas([...turmas, newTurma]);
            } else {
              const newTurma = { nome: input };
              await turmaService.create(newTurma);
              const turmasResponse = await turmaService.getAll();
              setTurmas(turmasResponse.data);
            }
            break;
            
          case "salas":
            if (useMockData) {
              const newSala = { 
                idSala: salas.length + 1, 
                nome: input 
              };
              setSalas([...salas, newSala]);
            } else {
              const newSala = { nome: input };
              await salaService.create(newSala);
              const salasResponse = await salaService.getAll();
              setSalas(salasResponse.data);
            }
            break;
            
          default:
            break;
        }
      }
      
      setInput(""); // Limpar o campo de input
      setSelectedItem(null); // Limpar seleção
      
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
          if (useMockData) {
            setDisciplinas(disciplinas.filter((_, i) => i !== selectedItem));
          } else {
            const disciplina = disciplinas[selectedItem];
            const id = disciplina.idUC || disciplina.IdUC;
            await ucService.delete(id);
            const disciplinasResponse = await ucService.getAll();
            setDisciplinas(disciplinasResponse.data);
          }
          break;
          
        case "turmas":
          if (useMockData) {
            setTurmas(turmas.filter((_, i) => i !== selectedItem));
          } else {
            const turma = turmas[selectedItem];
            const id = turma.idTurma || turma.id;
            await turmaService.delete(id);
            const turmasResponse = await turmaService.getAll();
            setTurmas(turmasResponse.data);
          }
          break;
          
        case "salas":
          if (useMockData) {
            setSalas(salas.filter((_, i) => i !== selectedItem));
          } else {
            const sala = salas[selectedItem];
            const id = sala.idSala || sala.id;
            await salaService.delete(id);
            const salasResponse = await salaService.getAll();
            setSalas(salasResponse.data);
          }
          break;
          
        default:
          break;
      }
      
      setSelectedItem(null);
      
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
        setInput(professores[index].nome || "");
        break;
      case "disciplinas":
        setInput(disciplinas[index].nomeUC || disciplinas[index].NomeUC || "");
        break;
      case "turmas":
        setInput(turmas[index].nome || "");
        break;
      case "salas":
        setInput(salas[index].nome || "");
        break;
      default:
        break;
    }
  };

  // Função para renderizar uma lista com tratamento de objetos
  const renderList = (items, type) => {
    return items.map((item, index) => {
      let displayText = 'Item sem nome';
      
      switch (type) {
        case 'professores':
          displayText = item.nome || `ID: ${item.id}`;
          break;
        case 'disciplinas':
          displayText = item.nomeUC || item.NomeUC || `ID: ${item.idUC || item.IdUC}`;
          break;
        case 'turmas':
          displayText = item.nome || `ID: ${item.idTurma || item.id}`;
          break;
        case 'salas':
          displayText = item.nome || `ID: ${item.idSala || item.id}`;
          break;
        default:
          displayText = item.nome || item.id || 'Item sem nome';
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
      
      {/* Mensagem se estiver usando dados mock */}
      {useMockData && (
        <div className="info-message" style={{ backgroundColor: "#e6f7ff", color: "#0066cc", padding: "6px 8px", borderRadius: "3px", marginBottom: "10px", borderLeft: "3px solid #0066cc", fontSize: "12px" }}>
          Backend não disponível. Usando dados de demonstração.
        </div>
      )}

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
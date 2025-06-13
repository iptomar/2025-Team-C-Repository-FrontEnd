import React, { useState, useEffect } from "react";
import "../Styles/CRUDInt.css";

// Importar os serviços de API
import turmaService from "../services/turmaService";
import salaService from "../services/salaService";
import escolaService from "../services/escolaService";
import cursoService from "../services/cursoService";
import ucService from "../services/ucService"; // Para UCs
import utilizadorService from "../services/utilizadorService"; // Para professores
import api from "../services/api";

function CRUDInt() {
  // Estados para armazenar as escolas e cursos
  const [escolas, setEscolas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedEscola, setSelectedEscola] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");

  // Estados para armazenar os dados
  const [professores, setProfessores] = useState([]);
  const [UCs, setUCs] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [salas, setSalas] = useState([]);

  // Estados para filtros de pesquisa
  const [searchProf, setSearchProf] = useState("");
  const [searchUC, setSearchUC] = useState("");
  const [searchTurma, setSearchTurma] = useState("");
  const [searchSala, setSearchSala] = useState("");

  // Estado para controlar carregamento
  const [loading, setLoading] = useState({
    professores: false,
    UCs: false,
    turmas: false,
    salas: false,
  });

  // Estado para mensagens de erro
  const [error, setError] = useState(null);

  // Estados para os inputs e seleção
  const [input, setInput] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState("professores");

  useEffect(() => {
    fetchData();
    fetchEscolas();
    fetchCursos();
  }, []);

  const filterList = (items, type) => {
    let search = "";
    switch (type) {
      case "professores":
        search = searchProf.toLowerCase();
        return items.filter((item) =>
          (item.nome || "").toLowerCase().includes(search)
        );
      case "UCs":
        search = searchUC.toLowerCase();
        return items.filter((item) =>
          (item.nomeUC || item.NomeUC || "").toLowerCase().includes(search)
        );
      case "turmas":
        search = searchTurma.toLowerCase();
        return items.filter((item) =>
          (item.nome || "").toLowerCase().includes(search)
        );
      case "salas":
        search = searchSala.toLowerCase();
        return items.filter((item) =>
          (item.nome || "").toLowerCase().includes(search)
        );
      default:
        return items;
    }
  };

  // Função para buscar todos os dados da API
  const fetchData = async () => {
    try {
      setLoading((prev) => ({ ...prev, professores: true }));
      const professoresResponse = await utilizadorService.getDocentes();
      setProfessores(professoresResponse.data);
      setLoading((prev) => ({ ...prev, professores: false }));

      setLoading((prev) => ({ ...prev, UCs: true }));
      const ucsResponse = await ucService.getAll();
      setUCs(ucsResponse.data);
      setLoading((prev) => ({ ...prev, UCs: false }));

      setLoading((prev) => ({ ...prev, turmas: true }));
      const turmasResponse = await turmaService.getAll();
      setTurmas(turmasResponse.data);
      setLoading((prev) => ({ ...prev, turmas: false }));

      setLoading((prev) => ({ ...prev, salas: true }));
      const salasResponse = await salaService.getAll();
      setSalas(salasResponse.data);
      setLoading((prev) => ({ ...prev, salas: false }));

      setError(null);
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
      setLoading({
        professores: false,
        UCs: false,
        turmas: false,
        salas: false,
      });
    }
  };

  // Função para buscar escolas e cursos
  const fetchEscolas = async () => {
    try {
      const response = await escolaService.getAll();
      setEscolas(response.data);
    } catch (err) {
      setError("Erro ao carregar escolas: " + err.message);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await cursoService.getAll();
      setCursos(response.data);
    } catch (err) {
      setError("Erro ao carregar cursos: " + err.message);
    }
  };
  // -----

  // Função para remover um item
  const handleRemove = async () => {
    if (selectedItem === null) return;

    try {
      switch (selectedType) {
        case "professores":
          setError("Remoção de professores não suportada.");
          break;

        case "UCs":
          const disciplina = UCs[selectedItem];
          const idDisc = disciplina.idUC || disciplina.IdUC;
          await ucService.delete(idDisc);
          const ucsResponse = await ucService.getAll();
          setUCs(ucsResponse.data);
          break;

        case "turmas":
          const turma = turmas[selectedItem];
          const idTurma = turma.idTurma || turma.id;
          await turmaService.delete(idTurma);
          const turmasResponse = await turmaService.getAll();
          setTurmas(turmasResponse.data);
          break;

        case "salas":
          const sala = salas[selectedItem];
          const idSala = sala.idSala || sala.id;
          await salaService.delete(idSala);
          const salasResponse = await salaService.getAll();
          setSalas(salasResponse.data);
          break;

        default:
          break;
      }

      setSelectedItem(null);
    } catch (err) {
      // Verifica se a resposta contém uma mensagem de erro específica
      const apiMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message;
      setError(`Erro ao remover ${selectedType}: ${apiMessage}`);
      console.error("Erro ao remover:", err);
    }
  };

  // Função para selecionar um item
  const handleSelect = (type, index) => {
    setSelectedItem(index);
    setSelectedType(type);

    switch (type) {
      case "professores":
        setInput(professores[index].nome || "");
        break;
      case "UCs":
        setInput(UCs[index].nomeUC || UCs[index].NomeUC || "");
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
      let displayText = "Item sem nome";

      switch (type) {
        case "professores":
          displayText = item.nome || `ID: ${item.id}`;
          break;
        case "UCs":
          displayText =
            item.nomeUC || item.NomeUC || `ID: ${item.idUC || item.IdUC}`;
          break;
        case "turmas":
          displayText = item.nome || `ID: ${item.idTurma || item.id}`;
          break;
        case "salas":
          displayText = item.nome || `ID: ${item.idSala || item.id}`;
          break;
        default:
          displayText = item.nome || item.id || "Item sem nome";
      }

      return (
        <li
          key={index}
          onClick={() => handleSelect(type, index)}
          className={
            selectedItem === index && selectedType === type ? "selected" : ""
          }
        >
          {displayText}
        </li>
      );
    });
  };

  // Filtrar cursos pela escola selecionada
  const filteredCursos = selectedEscola
    ? cursos.filter(
        (curso) => String(curso.escolaFK) === String(selectedEscola)
      )
    : cursos;

  // Filtrar UCs pelo curso selecionado
  const filteredUCs = selectedCurso
    ? UCs.filter(
        (uc) => String(uc.cursoFK ?? uc.CursoFK) === String(selectedCurso)
      )
    : UCs;

  // Filtrar turmas pelo curso selecionado
  const filteredTurmas = selectedCurso
    ? turmas.filter(
        (turma) =>
          String(turma.cursoFK ?? turma.CursoFK) === String(selectedCurso)
      )
    : turmas;

  return (
    <div className="crud-int-container">
      <h1>Gestão de Professores, Unidades Curriculares, Turmas e Salas</h1>

      {/* Mensagem de erro */}
      {error && <div className="error-message">{error}</div>}

      {/* Filtros de Escola e Curso */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select
          value={selectedEscola}
          onChange={(e) => {
            setSelectedEscola(e.target.value);
            setSelectedCurso(""); // Limpa curso ao trocar escola
          }}
        >
          <option value="">Filtrar por Escola</option>
          {escolas.map((escola) => (
            <option key={escola.idEscola} value={escola.idEscola}>
              {escola.nome}
            </option>
          ))}
        </select>
        <select
          value={selectedCurso}
          onChange={(e) => setSelectedCurso(e.target.value)}
          disabled={!selectedEscola}
        >
          <option value="">Filtrar por Curso</option>
          {filteredCursos.map((curso) => (
            <option key={curso.idCurso} value={curso.idCurso}>
              {curso.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Botões globais */}
      <div className="action-buttons-container">
        <button className="action-button">
          {selectedItem !== null ? "Editar" : "Adicionar"}
        </button>
        <button
          className="action-button"
          onClick={handleRemove}
          disabled={selectedItem === null}
        >
          Remover
        </button>
        <button className="action-button" onClick={fetchData}>
          Recarregar
        </button>
      </div>

      {/* Listas de itens com indicadores de carregamento */}
      <div style={{ marginTop: "20px" }}>
        <h2>Professores</h2>
        <input
          type="text"
          placeholder="Pesquisar professor"
          value={searchProf}
          onChange={(e) => setSearchProf(e.target.value)}
          style={{ marginBottom: "8px", padding: "4px", width: "100%" }}
        />
        <ul className="scrollable-list">
          {loading.professores ? (
            <li>Carregando professores...</li>
          ) : professores.length > 0 ? (
            renderList(filterList(professores, "professores"))
          ) : (
            <li>Nenhum professor cadastrado</li>
          )}
        </ul>

        <h2>UCs</h2>
        <input
          type="text"
          placeholder="Pesquisar UC"
          value={searchUC}
          onChange={(e) => setSearchUC(e.target.value)}
          style={{ marginBottom: "8px", padding: "4px", width: "100%" }}
        />
        <ul className="scrollable-list">
          {loading.UCs ? (
            <li>Carregando UCs...</li>
          ) : UCs.length > 0 ? (
            renderList(filterList(filteredUCs, "UCs"), "UCs")
          ) : (
            <li>Nenhuma disciplina cadastrada</li>
          )}
        </ul>

        <h2>Turmas</h2>
        <input
          type="text"
          placeholder="Pesquisar turma"
          value={searchTurma}
          onChange={(e) => setSearchTurma(e.target.value)}
          style={{ marginBottom: "8px", padding: "4px", width: "100%" }}
        />
        <ul className="scrollable-list">
          {loading.turmas ? (
            <li>Carregando turmas...</li>
          ) : turmas.length > 0 ? (
            renderList(filterList(filteredTurmas, "turmas"), "turmas")
          ) : (
            <li>Nenhuma turma cadastrada</li>
          )}
        </ul>

        <h2>Salas</h2>
        <input
          type="text"
          placeholder="Pesquisar sala"
          value={searchSala}
          onChange={(e) => setSearchSala(e.target.value)}
          style={{ marginBottom: "8px", padding: "4px", width: "100%" }}
        />
        <ul className="scrollable-list">
          {loading.salas ? (
            <li>Carregando salas...</li>
          ) : salas.length > 0 ? (
            renderList(filterList(salas, "salas"), "salas")
          ) : (
            <li>Nenhuma sala cadastrada</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default CRUDInt;

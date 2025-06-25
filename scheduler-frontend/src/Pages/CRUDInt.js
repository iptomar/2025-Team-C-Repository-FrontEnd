import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../Styles/CRUDInt.css";
import turmaService from "../services/turmaService";
import salaService from "../services/salaService";
import escolaService from "../services/escolaService";
import cursoService from "../services/cursoService";
import ucService from "../services/ucService";
import utilizadorService from "../services/utilizadorService";
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

  // Estado para edição
  const [editData, setEditData] = useState(null);

  // Hook para navegação
  const history = useHistory();

  // Carregar dados iniciais ao montar o componente
  useEffect(() => {
    fetchData();
    fetchEscolas();
    fetchCursos();
  }, []);

  // Função para saber se pode editar (apenas UCs e turmas)
  const canEdit = () => {
    return selectedType === "UCs" || selectedType === "turmas";
  };

  // Função para saber se pode remover (apenas UCs e turmas)
  const canRemove = () => {
    return selectedType === "UCs" || selectedType === "turmas";
  };

  // Função para filtrar listas com base no tipo
  // e no termo de pesquisa
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

  // Função para buscar cursos
  const fetchCursos = async () => {
    try {
      const response = await cursoService.getAll();
      setCursos(response.data);
    } catch (err) {
      setError("Erro ao carregar cursos: " + err.message);
    }
  };

  // Função para remover um item
  const handleRemove = async () => {
    if (selectedItem === null) return;

    if (!canRemove()) {
      setError("Não é possível remover Professores ou Salas.");
      return;
    }

    // Limpar mensagem de erro antes de tentar remover
    try {
      switch (selectedType) {
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

        default:
          break;
      }

      setSelectedItem(null);
    } catch (err) {
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

  // Função para iniciar edição
  const handleEdit = () => {
    if (selectedItem === null) return;
    if (selectedType === "UCs") {
      setEditData({ ...UCs[selectedItem] });
    } else if (selectedType === "turmas") {
      setEditData({ ...turmas[selectedItem] });
    }
  };

  // Função para salvar edição
  const handleSaveEdit = async () => {
    try {
      if (selectedType === "UCs") {
        const id = editData.idUC || editData.IdUC;
        await ucService.update(id, editData);
        const ucsResponse = await ucService.getAll();
        setUCs(ucsResponse.data);
      } else if (selectedType === "turmas") {
        const id = editData.idTurma || editData.id;
        await turmaService.update(id, editData);
        const turmasResponse = await turmaService.getAll();
        setTurmas(turmasResponse.data);
      }
      setEditData(null);
      setSelectedItem(null);
    } catch (err) {
      setError("Erro ao salvar edição: " + err.message);
    }
  };

  // Função para lidar com o clique do botão Adicionar/Editar
  const handleAddOrEdit = () => {
    if (selectedItem === null) {
      history.push("/add");
    } else {
      if (canEdit()) {
        handleEdit();
      }
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
        <button
          className="action-button"
          onClick={handleAddOrEdit}
          disabled={selectedItem !== null && !canEdit()}
          title={
            selectedItem !== null && !canEdit()
              ? "Não é possível editar Professores ou Salas"
              : selectedItem !== null
              ? "Editar"
              : "Adicionar"
          }
          style={
            selectedItem !== null && !canEdit()
              ? { background: "#ccc", cursor: "not-allowed" }
              : {}
          }
        >
          {selectedItem !== null
            ? canEdit()
              ? "Editar"
              : "Editar não disponível"
            : "Adicionar"}
        </button>
        <button
          className="action-button"
          onClick={handleRemove}
          disabled={selectedItem === null || !canRemove()}
          title={
            selectedItem !== null && !canRemove()
              ? "Não é possível remover Professores ou Salas"
              : "Remover"
          }
          style={
            selectedItem !== null && !canRemove()
              ? { background: "#ccc", cursor: "not-allowed" }
              : {}
          }
        >
          {selectedItem !== null && !canRemove()
            ? "Remover não disponível"
            : "Remover"}
        </button>
        <button className="action-button" onClick={fetchData}>
          Recarregar
        </button>
      </div>

      {/* Modal de edição para UC e Turma */}
      {editData && (
        <div
          className="edit-modal"
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            padding: "20px",
            margin: "20px 0",
          }}
        >
          <h3>Editar {selectedType === "UCs" ? "UC" : "Turma"}</h3>
          {selectedType === "UCs" ? (
            <>
              <input
                type="text"
                value={editData.nomeUC || ""}
                onChange={e =>
                  setEditData({ ...editData, nomeUC: e.target.value })
                }
                placeholder="Nome da UC"
                style={{ marginBottom: 8, width: "100%" }}
              />
              {/* Dropdown para Tipo UC */}
              <select
                value={editData.tipoUC || ""}
                onChange={e =>
                  setEditData({ ...editData, tipoUC: e.target.value })
                }
                style={{ marginBottom: 8, width: "100%" }}
              >
                <option value="">Selecione o tipo</option>
                <option value="Teórico-prática">Teórico-prática</option>
                <option value="Teórica">Teórica</option>
                <option value="Prática">Prática</option>
              </select>
              {/* Dropdown para Grau Académico */}
              <select
                value={editData.grauAcademico || ""}
                onChange={e =>
                  setEditData({ ...editData, grauAcademico: e.target.value })
                }
                style={{ marginBottom: 8, width: "100%" }}
              >
                <option value="">Selecione o grau académico</option>
                <option value="Licenciatura">Licenciatura</option>
                <option value="Mestrado">Mestrado</option>
                <option value="Doutoramento">Doutoramento</option>
              </select>
              {/* Dropdown para Semestre */}
              <select
                value={editData.semestre || ""}
                onChange={e =>
                  setEditData({ ...editData, semestre: e.target.value })
                }
                style={{ marginBottom: 8, width: "100%" }}
              >
                <option value="">Selecione o semestre</option>
                <option value="1º">1º Semestre</option>
                <option value="2º">2º Semestre</option>
                <option value="Anual">Anual</option>
              </select>
              <input
                type="number"
                value={editData.ano || ""}
                onChange={e =>
                  setEditData({ ...editData, ano: e.target.value })
                }
                placeholder="Ano"
                style={{ marginBottom: 8, width: "100%" }}
              />
              {/* Dropdown para Curso */}
              <select
                value={editData.cursoFK || ""}
                onChange={e =>
                  setEditData({ ...editData, cursoFK: e.target.value })
                }
                style={{ marginBottom: 8, width: "100%" }}
              >
                <option value="">Selecione o Curso</option>
                {cursos.map((curso) => (
                  <option key={curso.idCurso} value={curso.idCurso}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <input
                type="text"
                value={editData.nome || ""}
                onChange={e =>
                  setEditData({ ...editData, nome: e.target.value })
                }
                placeholder="Nome da Turma"
                style={{ marginBottom: 8, width: "100%" }}
              />
              {/* Dropdown para Curso */}
              <select
                value={editData.cursoFK || ""}
                onChange={e =>
                  setEditData({ ...editData, cursoFK: e.target.value })
                }
                style={{ marginBottom: 8, width: "100%" }}
              >
                <option value="">Selecione o Curso</option>
                {cursos.map((curso) => (
                  <option key={curso.idCurso} value={curso.idCurso}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </>
          )}
          <div style={{ marginTop: 10 }}>
            <button className="action-button" onClick={handleSaveEdit}>
              Guardar
            </button>
            <button
              className="action-button"
              style={{ marginLeft: 8 }}
              onClick={() => setEditData(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
            <li>A carregar docentes...</li>
          ) : professores.length > 0 ? (
            renderList(filterList(professores, "professores"), "professores")
          ) : (
            <li>Nenhum professor registado</li>
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
            <li>A carregar UCs...</li>
          ) : UCs.length > 0 ? (
            renderList(filterList(filteredUCs, "UCs"), "UCs")
          ) : (
            <li>Nenhuma UC registada</li>
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
            <li>A carregar turmas...</li>
          ) : turmas.length > 0 ? (
            renderList(filterList(filteredTurmas, "turmas"), "turmas")
          ) : (
            <li>Nenhuma turma registada</li>
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
            <li>A carregar salas...</li>
          ) : salas.length > 0 ? (
            renderList(filterList(salas, "salas"), "salas")
          ) : (
            <li>Nenhuma sala registada</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default CRUDInt;
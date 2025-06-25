import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import turmaService from "../services/turmaService";
import ucService from "../services/ucService";
import cursoService from "../services/cursoService";
import "../Styles/Add.css";

function Add() {
  const history = useHistory();
  const [escolha, setEscolha] = useState(""); // turma ou uc
  const [nome, setNome] = useState(""); // nome da turma ou UC
  const [mensagem, setMensagem] = useState("");
  const [msgType, setMsgType] = useState(""); // success or error
  const [cursos, setCursos] = useState([]); // lista de cursos
  const [cursoFK, setCursoFK] = useState(""); // id do curso selecionado

  // Campos UC
  const [tipoUC, setTipoUC] = useState("");
  const [grauAcademico, setGrauAcademico] = useState("");
  const [tipologia, setTipologia] = useState("");
  const [semestre, setSemestre] = useState("");
  const [ano, setAno] = useState("");

  // Buscar cursos ao montar
  useEffect(() => {
    if (escolha === "turma" || escolha === "uc") {
      cursoService
        .getAll()
        .then((res) => setCursos(res.data))
        .catch(() => setCursos([]));
    }
  }, [escolha]);

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (escolha === "turma") {
        if (!cursoFK) {
          setMensagem("Selecione um curso.");
          setMsgType("error");
          return;
        }
        await turmaService.create({ nome, cursoFK: parseInt(cursoFK, 10) });
        setMensagem("Turma adicionada com sucesso!");
        setMsgType("success");
        setNome("");
        setCursoFK("");
      } else if (escolha === "uc") {
        if (!cursoFK || !nome || !tipoUC || !grauAcademico || !semestre) {
          setMensagem("Preencha todos os campos obrigatórios.");
          setMsgType("error");
          return;
        }
        await ucService.create({
          nomeUC: nome,
          tipoUC,
          grauAcademico,
          tipologia,
          semestre,
          ano: ano ? parseInt(ano, 10) : null,
          cursoFK: parseInt(cursoFK, 10),
        });
        setMensagem("UC adicionada com sucesso!");
        setMsgType("success");
        setNome("");
        setTipoUC("");
        setGrauAcademico("");
        setTipologia("");
        setSemestre("");
        setAno("");
        setCursoFK("");
      }
    } catch (error) {
      setMensagem("Erro ao adicionar.");
      setMsgType("error");
    }
  };

  // Formulário dinâmico
  const renderFormulario = () => {
    if (escolha === "turma") {
      return (
        <form className="add-form" onSubmit={handleSubmit}>
          <h3 className="form-title">Adicionar Turma</h3>
          
          <div className="form-group">
            <label className="form-label">Nome da Turma:</label>
            <input
              className="form-input"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Curso:</label>
            <select
              className="form-select"
              value={cursoFK}
              onChange={(e) => setCursoFK(e.target.value)}
              required
            >
              <option value="">Selecione o curso</option>
              {cursos.map((curso) => (
                <option
                  key={curso.id || curso.Id || curso.idCurso}
                  value={curso.id || curso.Id || curso.idCurso}
                >
                  {curso.nome || curso.Nome}
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="form-button">
            Guardar
          </button>
        </form>
      );
    }
    if (escolha === "uc") {
      return (
        <form className="add-form" onSubmit={handleSubmit}>
          <h3 className="form-title">Adicionar Unidade Curricular</h3>
          
          <div className="form-group">
            <label className="form-label">Nome da Unidade Curricular:</label>
            <input
              className="form-input"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Tipo de Unidade Curricular:</label>
            <select
              className="form-select"
              value={tipoUC}
              onChange={(e) => setTipoUC(e.target.value)}
              required
            >
              <option value="">Selecione um tipo</option>
              <option value="Teórico-prática">Teórico-prática</option>
              <option value="Teórica">Teórica</option>
              <option value="Prática">Prática</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Grau Académico:</label>
            <select
              className="form-select"
              value={grauAcademico}
              onChange={(e) => setGrauAcademico(e.target.value)}
              required
            >
              <option value="">Selecione um grau</option>
              <option value="Licenciatura">Licenciatura</option>
              <option value="Mestrado">Mestrado</option>
              <option value="Doutoramento">Doutoramento</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Semestre:</label>
            <select
              className="form-select"
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              required
            >
              <option value="">Selecione um semestre</option>
              <option value="1º">1º Semestre</option>
              <option value="2º">2º Semestre</option>
              <option value="Anual">Anual</option>
            </select>
          </div>
          
          <div className="inline-form-group">
            <label className="form-label">Ano:</label>
            <input
              className="form-input small-input"
              type="number"
              placeholder="Ano"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Curso:</label>
            <select
              className="form-select"
              value={cursoFK}
              onChange={(e) => setCursoFK(e.target.value)}
              required
            >
              <option value="">Selecione o curso</option>
              {cursos.map((curso) => (
                <option
                  key={curso.id || curso.Id || curso.idCurso}
                  value={curso.id || curso.Id || curso.idCurso}
                >
                  {curso.nome || curso.Nome}
                </option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="form-button">
            Guardar
          </button>
        </form>
      );
    }
    return null;
  };

  return (
    <div className="add-container">
      <button
        onClick={() => history.push("/crud")}
        className="back-button"
      >
        ← Voltar à Gestão
      </button>
      
      <h2>O que deseja adicionar?</h2>
      
      <div className="action-buttons-container">
        <button
          className="action-button"
          onClick={() => {
            setEscolha("turma");
            setMensagem("");
          }}
        >
          Adicionar Turma
        </button>
        
        <button
          className="action-button"
          onClick={() => {
            setEscolha("uc");
            setMensagem("");
          }}
        >
          Adicionar UC
        </button>
      </div>
      
      {renderFormulario()}
      
      {mensagem && (
        <div className={`message ${msgType === "success" ? "success-message" : "error-message"}`}>
          {mensagem}
        </div>
      )}
    </div>
  );
}

export default Add;
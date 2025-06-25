import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import turmaService from "../services/turmaService";
import ucService from "../services/ucService";
import cursoService from "../services/cursoService";

function Add() {
  const history = useHistory();
  const [escolha, setEscolha] = useState(""); // turma ou uc
  const [nome, setNome] = useState(""); // nome da turma ou UC
  const [mensagem, setMensagem] = useState("");
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
          return;
        }
        await turmaService.create({ nome, cursoFK: parseInt(cursoFK, 10) });
        setMensagem("Turma adicionada com sucesso!");
        setNome("");
        setCursoFK("");
      } else if (escolha === "uc") {
        if (!cursoFK || !nome || !tipoUC || !grauAcademico || !semestre) {
          setMensagem("Preencha todos os campos obrigatórios.");
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
    }
  };

  // Formulário dinâmico
  const renderFormulario = () => {
    if (escolha === "turma") {
      return (
        <form style={{ marginTop: 24 }} onSubmit={handleSubmit}>
          <h3>Adicionar Turma</h3>
          <label>Nome da Turma:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <label>Curso:</label>
          <select
            value={cursoFK}
            onChange={(e) => setCursoFK(e.target.value)}
            required
            style={{ marginLeft: 8 }}
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
          <button type="submit" style={{ marginLeft: 8 }}>
            Guardar
          </button>
        </form>
      );
    }
    if (escolha === "uc") {
      return (
        <form style={{ marginTop: 24 }} onSubmit={handleSubmit}>
          <h3>Adicionar UC</h3>
          <label>Nome da Unidade Curricular:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <label>Tipo de Unidade Curricular:</label>
          <select
            value={tipoUC}
            onChange={(e) => setTipoUC(e.target.value)}
            required
            style={{ marginLeft: 8 }}
          >
            <option value="">Selecione um tipo</option>
            <option value="Teórico-prática">Teórico-prática</option>
            <option value="Teórica">Teórica</option>
            <option value="Prática">Prática</option>
          </select>
          <label>Grau Académico:</label>
          <select
            value={grauAcademico}
            onChange={(e) => setGrauAcademico(e.target.value)}
            required
            style={{ marginLeft: 8 }}
          >
            <option value="">Selecione um grau</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Mestrado">Mestrado</option>
            <option value="Doutoramento">Doutoramento</option>
          </select>
          <label>Semestre:</label>
          <select
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            required
            style={{ marginLeft: 8 }}
          >
            <option value="">Selecione um semestre</option>
            <option value="1º">1º Semestre</option>
            <option value="2º">2º Semestre</option>
            <option value="Anual">Anual</option>
          </select>
          <label>Ano:</label>
          <input
            type="number"
            placeholder="Ano"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            style={{ marginLeft: 8, width: 70 }}
          />
          <label>Curso:</label>
          <select
            value={cursoFK}
            onChange={(e) => setCursoFK(e.target.value)}
            required
            style={{ marginLeft: 8 }}
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
          <button type="submit" style={{ marginLeft: 8 }}>
            Guardar
          </button>
        </form>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Botão bonito para voltar */}
      <button
        onClick={() => history.push("/crud")}
        style={{
          background: "#e0e7ef",
          color: "#222",
          border: "1px solid #b0b8c1",
          borderRadius: 4,
          padding: "8px 18px",
          fontSize: "1rem",
          cursor: "pointer",
          marginBottom: 24,
          marginRight: 12,
          transition: "background 0.2s",
        }}
        onMouseOver={e => (e.target.style.background = "#c9d6e3")}
        onMouseOut={e => (e.target.style.background = "#e0e7ef")}
      >
        ← Voltar à Gestão
      </button>
      <h2>O que deseja adicionar?</h2>
      <button
        onClick={() => {
          setEscolha("turma");
          setMensagem("");
        }}
      >
        Adicionar Turma
      </button>
      <button
        onClick={() => {
          setEscolha("uc");
          setMensagem("");
        }}
        style={{ marginLeft: 16 }}
      >
        Adicionar UC
      </button>
      {renderFormulario()}
      {mensagem && <p style={{ marginTop: 16 }}>{mensagem}</p>}
    </div>
  );
}

export default Add;
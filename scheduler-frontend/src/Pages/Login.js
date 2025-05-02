import React, { use, useEffect, useState } from "react";
import "../Styles/Login.css";
import { loginUser } from "../services/authService";
import logo from '../Assets/logoipt.png';

function Login() {
  // Definir estados para email e password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Verificar se o utilizador já está autenticado
    const token = localStorage.getItem("token");
    if (token) {
      // Se já estiver autenticado, redirecionar para a página de criação de horários
      window.location.href = "/schedule";
    }
  });

  // Função para fazer login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await loginUser(email, password);
      alert('Login efetuado com sucesso!');
      // Redirecionar para a página da criação de horários
      window.location.href = "/schedule";
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
      <img src={logo} alt="Logotipo" className="login-logo" />
        <h2>Iniciar Sessão</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Palavra-passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;
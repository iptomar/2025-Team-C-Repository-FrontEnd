import React, { use, useEffect, useState } from "react";
import "../Styles/Login.css";
import { loginUser } from "../services/authService";
import logo from '../Assets/logoipt.png';
import Popup from '../Components/Popup'; // Importa o Popup

function Login() {
  // Definir estados para email e password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState({ open: false, message: "" }); // Estado do popup

  useEffect(() => {
    // Verificar se o utilizador já está autenticado
    const token = localStorage.getItem("token");
    if (token) {
      // Se já estiver autenticado, redirecionar para a página de criação de horários
      window.location.href = "/schedule";
    }
  }, []);

  // Função para fazer login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await loginUser(email, password);
      setPopup({ open: true, message: "Login efetuado com sucesso!" });
      setTimeout(() => {
        window.location.href = "/schedule";
      }, 1200); // Aguarda popup antes de redirecionar
    } catch (error) {
      setPopup({ open: true, message: `Erro: ${error.message}` });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <img src={logo} alt="Logotipo" className="login-logo" />
          <h2>Iniciar Sessão</h2>
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" type="submit">Entrar</button>
        </form>
        <Popup
          open={popup.open}
          message={popup.message}
          onClose={() => setPopup({ ...popup, open: false })}
        />
      </div>
    </div>
  );
}

export default Login;
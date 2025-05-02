// Pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../logoipt.png';
import '../Styles/Home.css'; 

function Home() {
  return (
    <header className="App-header">
      <img src={logo} alt="Logotipo Gestão de Horários" className="App-logo" />
      <h1>Gestão de Horários</h1>
      <p>Bem-vindo à aplicação de gestão de horários.</p>

      <div className="button-container">
        <Link to="/login">
          <button className="main-button">Iniciar Sessão</button>
        </Link>
      </div>
    </header>
  );
}

export default Home;

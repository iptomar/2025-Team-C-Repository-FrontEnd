import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import './App.css';
import logo from './logoipt.png';
//import CRUDInt from './Pages/CRUDInt'; // Página de CRUD
import Login from './Pages/Login';
import ScheduleView from "./Pages/ScheduleView";
import { useEffect, useState } from 'react';


function App() {
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <img src={logo} alt="Logotipo Gestão de Horários" className="App-logo" />
          <h1>Gestão de Horários</h1>
          <p>Bem-vindo à aplicação de gestão de horários.</p>

          <div className="button-container">
            {/* Botão para a página de Login */}
            <Link to="/login">
              <button className="main-button">Login</button>
            </Link>

            {/* Botão para a página de CRUD 
            <Link to="/crud">
              <button className="main-button">CRUD</button>
            </Link>
            */}
          </div>
        </header>

        {/* Rotas para as páginas */}
        <Switch>
          <Route path="/login" component={Login} />
          {/*<Route path="/crud" component={CRUDInt} />*/}
          <Route path="/schedule" component={ScheduleView} /> {/* Página de criação de horários */}
        </Switch>
      </Router>
    </div>
  );
}

export default App;
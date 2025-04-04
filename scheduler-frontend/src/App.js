import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import './App.css';
//import Login from './Pages/Login'; // Página de Login
//import CRUDInt from './Pages/CRUDInt'; // Página de CRUD

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Gestão de Horários</h1>
          <p>Bem-vindo à aplicação de gestão de horários.</p>
          <div className="button-container">
            {/* Botão para a página de Login */}
            <Link to="/login">
              <button className="main-button">Login</button>
            </Link>
            {/* Botão para a página de CRUD */}
            <Link to="/crud">
              <button className="main-button">CRUD</button>
            </Link>
          </div>
        </header>
        {/* <Switch> 
           //Rota para a página de Login 
          <Route path="/login" component={Login} />
           //Rota para a página de CRUD 
          <Route path="/crud" component={CRUDInt} />
        </Switch> */}
      </div>
    </Router>
  );
}

export default App;
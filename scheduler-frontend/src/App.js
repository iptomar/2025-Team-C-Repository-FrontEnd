import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Login from './Pages/Login';
import ScheduleView from "./Pages/ScheduleView";
import { useEffect, useState } from 'react';

function App() {

  return (
    <div className="App">
      <Router>
        {/* Navegação para a página de login */}
        <nav>
          <Link to="/login">Login</Link>
        </nav>
        <Switch>
          {/* Rota para a página de login */}
          <Route path="/login" component={Login} />
          {/* Rota para a página de criação de horários */}
          <Route path="/schedule" component={ScheduleView}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
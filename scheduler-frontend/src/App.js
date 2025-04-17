import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import './App.css';
import logo from './logoipt.png';
//import CRUDInt from './Pages/CRUDInt'; // Página de CRUD
import Login from './Pages/Login';
import ScheduleView from "./Pages/ScheduleView";
import { useEffect, useState } from 'react';
import Home from './Pages/Home'; // Página inicial


function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/schedule" component={ScheduleView} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
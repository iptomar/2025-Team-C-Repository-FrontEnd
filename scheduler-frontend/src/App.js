import React from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import './App.css';
import CRUDInt from './Pages/CRUDInt';
import Login from './Pages/Login';
import ScheduleView from "./Pages/ScheduleView";
import Home from './Pages/Home';
import UploadData from './Pages/UploadData';
import Navbar from './Pages/NavBar';

const AppContent = () => {
  const location = useLocation();
  const hideNavbarOn = ['/', '/login'];
  const showNavbar = !hideNavbarOn.includes(location.pathname);
  
  return (
    <>
      {showNavbar && <Navbar />}
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/schedule" component={ScheduleView} />
        <Route path="/upload-data" component={UploadData} />
        <Route path="/crud" component={CRUDInt} />
        <Route path="/" exact component={Home} />
      </Switch>
    </>
  );
};

function App() {
  return (
    <div className="App">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../logoipt.png';
import '../Styles/NavBar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo-container">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </div>
      
      <div className="navbar-links">
        <Link to="/schedule" className="navbar-link">
          Horários
        </Link>
        
        <Link to="/crud" className="navbar-link">
          CRUD
        </Link>
        
        <Link to="/upload-data" className="navbar-link">
          Upload de Dados
        </Link>
      </div>
      
      <div>
        <Link to="/login" className="navbar-login-btn">
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
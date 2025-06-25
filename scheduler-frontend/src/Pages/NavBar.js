import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import logo from '../logoipt.png';
import '../Styles/NavBar.css';

const Navbar = () => {
  const [userRole, setUserRole] = useState('');
  
  // Check user role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Only admin/manager users should see CRUD and Upload de Dados
  const isDocente = userRole === 'Docente';

  return (
    <nav className="navbar">
      <div className="navbar-logo-container">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </div>
      
      <div className="navbar-links">
        <Link to="/schedule" className="navbar-link">
          Horários
        </Link>
        
        {!isDocente && (
          <>
            <Link to="/crud" className="navbar-link">
              CRUD
            </Link>
            
            <Link to="/upload-data" className="navbar-link">
              Upload de Dados
            </Link>
          </>
        )}
      </div>
      
      <div>
        <Link to="/" className="navbar-home-btn">
          Home
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
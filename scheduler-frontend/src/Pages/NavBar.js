import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import logo from '../logoipt.png';
import '../Styles/NavBar.css';

/* Componente de Barra de Navegação */
const Navbar = () => {
  // Estado para armazenar o papel do utilizador (docente, administrador, etc.)
  const [userRole, setUserRole] = useState('');
  
  // Verificar o papel do utilizador quando o componente é montado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Descodificar o token JWT para obter as informações do utilizador
        const decoded = jwtDecode(token);
        setUserRole(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      } catch (error) {
        console.error('Erro ao descodificar o token:', error);
      }
    }
  }, []);

  // Verificar se o utilizador é um docente para mostrar apenas as opções relevantes
  const isDocente = userRole === 'Docente';

  return (
    <nav className="navbar">
      <div className="navbar-logo-container">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </div>
      
      {/*links de navegação */}
      <div className="navbar-links">
        {/* Todos os utilizadores podem ver os horários */}
        <Link to="/schedule" className="navbar-link">
          Horários
        </Link>
        
        {/* Os docentes não devem poder ver os outros links*/}
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
      
      {/* Botão para regressar à página inicial */}
      <div>
        <Link to="/" className="navbar-home-btn">
          Home
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
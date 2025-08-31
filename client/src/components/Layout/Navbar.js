import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="nav-link">
          Finance Assistant
        </Link>
      </div>
      
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/transactions" className="nav-link">
            Transactions
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/upload" className="nav-link">
            Upload
          </Link>
        </li>
        <li className="nav-item">
          <span className="nav-link" style={{ cursor: 'pointer' }} onClick={handleLogout}>
            Logout ({user?.name})
          </span>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
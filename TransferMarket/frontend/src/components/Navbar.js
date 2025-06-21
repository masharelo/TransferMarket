import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <div className="navbar-container">
      <h1 className="navbar-title">TransferMarket</h1>
      <nav className="navbar-nav">
        <span className="navbar-link" onClick={() => navigate('/home')}>🏠 Home</span>
        <span className="navbar-link" onClick={() => navigate('/transfers')}>📈 Transfers</span>
        <span className="navbar-link" onClick={() => navigate('/favourite_players')}>⭐ Favourite Players</span>
        <span className="navbar-link" onClick={() => navigate('/favourite_teams')}>⭐ Favourite Teams</span>
        <span className="navbar-link" onClick={() => navigate('/players')}>🐐 Players</span>
        <span className="navbar-link" onClick={() => navigate('/teams')}>⚽ Teams</span>
        <span className="navbar-link" onClick={() => navigate('/myprofile')}>🗝️ My Profile</span>
        <span className="navbar-link" onClick={() => { logout(); navigate('/login'); }}>🔒 Logout</span>
      </nav>
    </div>
  );
};

export default Navbar;

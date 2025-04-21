import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {

    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const { user } = useContext(AuthContext);

    return (
        <div style={{ backgroundColor: 'lightgray' }}>
          <h1>TransferMarket</h1>
          <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
            <span style={{cursor: 'pointer'}} onClick={() => {navigate('/home')}}>🏠 Home</span>
            <span style={{cursor: 'pointer'}} onClick={() => {navigate('/transfers')}}>📈 Transfers</span>
            <span style={{cursor: 'pointer'}} onClick={() => {navigate('/favourite_players')}}>⭐ Favourite Players</span>
            <span style={{cursor: 'pointer'}} onClick={() => {navigate('/favourite_teams')}}>⭐ Favourite Teams</span>
            <span style={{cursor: 'pointer'}} onClick={() => {navigate('/players')}}>🐐 Players</span>
            <span style={{cursor: 'pointer'}} onClick={() => {navigate('/teams')}}>⚽ Teams</span>
            <span style={{cursor: 'pointer'}} onClick={() => {navigate('/myprofile')}}>🗝️ My Profile</span>
            <span style={{cursor: 'pointer'}} onClick={() => {logout(); navigate('/login');}}>🔒 Logout</span>
          </nav>
          <p>Welcome, {user?.name} {user?.surname}!</p>
        </div>
      );
};

export default Navbar;

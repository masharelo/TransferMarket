import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { name: 'Posts', path: '/admin/edit_posts' },
    { name: 'Teams', path: '/admin/edit_teams' },
    { name: 'Players', path: '/admin/edit_players' },
    { name: 'Transfers', path: '/admin/edit_transfers' },
    { name: 'Users', path: '/admin/edit_users' },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🛠️ Admin Dashboard</h1>
      <div className="cards-grid">
        {cards.map((card) => (
          <div
            key={card.name}
            onClick={() => navigate(card.path)}
            className="card"
          >
            <h2 className="card-title">{card.name}</h2>
            <p className="card-description">Manage {card.name.toLowerCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

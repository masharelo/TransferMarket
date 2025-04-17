import React from 'react';

const user = JSON.parse(localStorage.getItem('user'));

const Home = () => {
  return (
    <div>
      <h1>TransferMarket</h1>
      <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <span>🏠 Home</span>
        <span style={{ cursor: 'pointer' }} onClick={() => {
          localStorage.clear();
          window.location.href = '/login';
        }}>
          🔒 Logout
        </span>
      </nav>
      <p>Welcome, {user?.name} {user?.surname}!</p>
    </div>
  );
};

export default Home;

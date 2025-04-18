import React, { useEffect, useState } from 'react';

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div>
      <h1>TransferMarket</h1>
      <nav style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
        <span>🏠 Home</span>
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          🔒 Logout
        </span>
      </nav>
      <p>Welcome, {user?.name} {user?.surname}!</p>
    </div>
  );
};

export default Home;

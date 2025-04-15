import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function HomePage() {
  return <h1>🏠 Welcome to TransferMarket</h1>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Add other routes here later (Login, Dashboard, etc) */}
      </Routes>
    </Router>
  );
}

export default App;

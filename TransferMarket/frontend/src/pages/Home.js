import React from 'react';
import Posts from '../components/Posts';
import './Home.css'

const Home = () => {
  return (
    <div className="home-header">
      <h1>🏠 Home</h1>
      <Posts />
    </div>
  );
};

export default Home;

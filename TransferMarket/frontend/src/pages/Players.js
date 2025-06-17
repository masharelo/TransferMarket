import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlayerCard from '../components/PlayerCard';
import './Players.css';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    const fetchInitialPlayers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/players?offset=0&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setPlayers(res.data);
        setOffset(limit);
        if (res.data.length < limit) setHasMore(false);
      } catch (err) {
        console.error('Failed to fetch players:', err);
      }
    };

    fetchInitialPlayers();
  }, []);

  const fetchMorePlayers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/players?offset=${offset}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setPlayers(prev => [...prev, ...res.data]);
      setOffset(prev => prev + limit);
      if (res.data.length < limit) setHasMore(false);
    } catch (err) {
      console.error('Failed to fetch more players:', err);
    }
  };

  const toggleFavourite = async (playerId) => {
    const token = localStorage.getItem('token');
    const player = players.find(p => p.player_id === playerId);

    try {
      if (player.is_favourite) {
        await axios.delete(`http://localhost:5000/api/auth/favourite_players/${playerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/auth/favourite_players/${playerId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setPlayers(prev =>
        prev.map(p => p.player_id === playerId ? { ...p, is_favourite: !p.is_favourite } : p)
      );
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  return (
    <div className="players-page">
      <h2>Players</h2>
      <div className="players-grid">
        {players.map(player => (
          <PlayerCard
            key={player.player_id}
            player={player}
            onToggleFavourite={toggleFavourite}
          />
        ))}
      </div>
      {hasMore && (
        <div className="load-more-container">
          <button className="LoadMoreButton" onClick={fetchMorePlayers}>Load More</button>
        </div>
      )}
    </div>
  );
};

export default Players;

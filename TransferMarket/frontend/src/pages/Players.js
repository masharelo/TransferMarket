import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlayerCard from '../components/PlayerCard';
import './Players.css';

const Players = () => {
  const [allPlayers, setAllPlayers] = useState([]);
  const [displayedPlayers, setDisplayedPlayers] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSorted, setIsSorted] = useState(false);
  const limit = 20;

  const fetchPaginated = async (offsetValue = 0) => {
    const res = await axios.get(`http://localhost:5000/api/auth/players?offset=${offsetValue}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.data;
  };

  const fetchAllPlayers = async () => {
    const res = await axios.get(`http://localhost:5000/api/auth/players/all`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.data;
  };

  useEffect(() => {
    const loadDefault = async () => {
      const initialPlayers = await fetchPaginated(0);
      setDisplayedPlayers(initialPlayers);
      setOffset(limit);
      setHasMore(initialPlayers.length === limit);
      setIsSorted(false);
    };

    loadDefault();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') return;
    const lower = searchTerm.toLowerCase();

    const fetchAndFilter = async () => {
      const all = await fetchAllPlayers();
      const filtered = all.filter(p =>
        `${p.name} ${p.surname}`.toLowerCase().includes(lower)
      );
      setDisplayedPlayers(filtered);
      setIsSorted(false);
      setHasMore(false);
    };

    fetchAndFilter();
  }, [searchTerm]);

  const sortByValue = async () => {
    const all = await fetchAllPlayers();
    const sorted = all.sort((a, b) => b.value - a.value);
    setAllPlayers(sorted);
    setDisplayedPlayers(sorted.slice(0, limit));
    setOffset(limit);
    setIsSorted(true);
    setHasMore(sorted.length > limit);
  };

  const fetchMorePlayers = async () => {
    if (isSorted) {
      const more = allPlayers.slice(offset, offset + limit);
      setDisplayedPlayers(prev => [...prev, ...more]);
      setOffset(prev => prev + limit);
      if (offset + limit >= allPlayers.length) setHasMore(false);
    } else {
      const more = await fetchPaginated(offset);
      setDisplayedPlayers(prev => [...prev, ...more]);
      setOffset(prev => prev + limit);
      if (more.length < limit) setHasMore(false);
    }
  };

  const toggleFavourite = async (playerId) => {
    const token = localStorage.getItem('token');
    const target = displayedPlayers.find(p => p.player_id === playerId);
    if (!target) return;

    try {
      if (target.is_favourite) {
        await axios.delete(`http://localhost:5000/api/auth/favourite_players/${playerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/auth/favourite_players/${playerId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      const update = p =>
        p.player_id === playerId ? { ...p, is_favourite: !p.is_favourite } : p;

      setDisplayedPlayers(prev => prev.map(update));
      setAllPlayers(prev => prev.map(update));
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  return (
    <div className="players-page">
      <h1>🐐 Players</h1>
      <div className="players-filters-name-club">
        <div className="players-filters-wrapper">
          <button className="sort-players-button" onClick={sortByValue}>Sort by Value</button>
          <input
            type="text"
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim() === '') {
                setOffset(0);
                setIsSorted(false);
                fetchPaginated(0).then(data => {
                  setDisplayedPlayers(data);
                  setHasMore(data.length === limit);
                });
              }
            }}
            className="transfers-filter"
          />
        </div>
      </div>

      <div className="players-grid">
        {displayedPlayers.map(player => (
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

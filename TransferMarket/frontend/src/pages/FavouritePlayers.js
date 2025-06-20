import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlayerCard from '../components/PlayerCard';
import './FavouritePlayers.css'

const FavouritePlayers = () => {
  const [players, setPlayers] = useState([]);
  const [temporarilyUnfavourited, setTemporarilyUnfavourited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/favourite_players', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPlayers(res.data);
      } catch (err) {
        console.error('Failed to fetch favourites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  useEffect(() => {
    let timeout;
    if (!loading && players.length === 0) {
      timeout = setTimeout(() => setShowEmptyMessage(true), 500);
    } else {
      setShowEmptyMessage(false);
    }

    return () => clearTimeout(timeout);
  }, [loading, players]);

  const toggleFavourite = async (playerId) => {
    const token = localStorage.getItem('token');

    if (temporarilyUnfavourited.includes(playerId)) {
      try {
        await axios.post(
          `http://localhost:5000/api/auth/favourite_players/${playerId}`,
          { player_id: playerId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTemporarilyUnfavourited((prev) => prev.filter((id) => id !== playerId));
      } catch (err) {
        console.error('Failed to re-favourite player:', err);
      }
    } else {
      try {
        await axios.delete(`http://localhost:5000/api/auth/favourite_players/${playerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTemporarilyUnfavourited((prev) => [...prev, playerId]);
      } catch (err) {
        console.error('Failed to unfavourite player:', err);
      }
    }
  };

  return (
    <div className="favourites-page">
      <h1>⭐ Favourite Players</h1>
      {loading ? (
        <p>Loading players...</p>
      ) : players.length === 0 && showEmptyMessage ? (
        <p>You haven't added any favourite players yet.</p>
      ) : (
        <div className="players-grid">
          {players.map((player) => {
            const isUnfavourited = temporarilyUnfavourited.includes(player.player_id);
            return (
              <PlayerCard
                key={player.player_id}
                player={{ ...player, is_favourite: !isUnfavourited }}
                onToggleFavourite={toggleFavourite}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavouritePlayers;

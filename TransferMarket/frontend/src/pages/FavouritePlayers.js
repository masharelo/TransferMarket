import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Favourite Players</h2>
      {loading ? (
        <p>Loading players...</p>
      ) : players.length === 0 && showEmptyMessage ? (
        <p>You haven't added any favourite players yet.</p>
      ) : (
        <ul>
          {players.map((player) => {
            const isUnfavourited = temporarilyUnfavourited.includes(player.player_id);
            return (
              <li key={player.player_id}>
                {player.name} - {player.surname}{' '}
                <span
                  style={{ cursor: 'pointer', color: isUnfavourited ? 'gray' : 'gold' }}
                  onClick={() => toggleFavourite(player.player_id)}
                >
                  {isUnfavourited ? '☆' : '★'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FavouritePlayers;
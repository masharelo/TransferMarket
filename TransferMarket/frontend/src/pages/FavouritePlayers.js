import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FavouritePlayers = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/favourite_players', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPlayers(res.data);
      } catch (err) {
        console.error('Failed to fetch favourites:', err);
      }
    };

    fetchFavourites();
  }, []);

  return (
    <div>
      <h2>Your Favourite Players</h2>
      {players.length === 0 ? (
        <p>You haven't added any favourite players yet.</p>
      ) : (
        <ul>
          {players.map(player => (
            <li key={player.player_id}>
              {player.name} {player.surname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavouritePlayers;

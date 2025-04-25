import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PlayerDetail.css';

const PlayerDetail = () => {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/players/${playerId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPlayer(res.data);
      } catch (err) {
        console.error('Error fetching player details', err);
      }
    };

    fetchPlayer();
  }, [playerId]);

  if (!player) return <p>Loading...</p>;

  return (
    <div className="player-detail">
      <img src={`http://localhost:5000/uploads/players/${player.picture}`} alt={`${player.name} ${player.surname}`} />
      <h2>{player.name} {player.surname}</h2>
      <p><strong>Club:</strong> {player.club}</p>
      <p><strong>Position:</strong> {player.position}</p>
      <p><strong>Nationality:</strong> {player.nationality}</p>
      <p><strong>Date of Birth:</strong> {player.date_of_birth}</p>
    </div>
  );
};

export default PlayerDetail;

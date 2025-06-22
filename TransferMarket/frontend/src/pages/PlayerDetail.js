import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PlayerDetail.css';
import countryNameToCode from "../utils/CountryToCode";
import formatDate from "../utils/FormatDate";
import getAge from "../utils/GetAge";
import formatValue from '../utils/FormatValue';

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

  const toggleFavourite = async () => {
    const token = localStorage.getItem("token");
    try {
      if (player.is_favourite) {
        await axios.delete(`http://localhost:5000/api/auth/favourite_players/${player.player_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/auth/favourite_players/${player.player_id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setPlayer(prev => ({ ...prev, is_favourite: !prev.is_favourite }));
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  if (!player) return <p>Loading...</p>;

  const countryCode = countryNameToCode[player.nationality];

  return (
    <div className="custom-player-layout">
      <div className="custom-player-card">
        <div className="custom-player-img-wrapper">
          <div className="custom-player-fav-container">
            <button
              onClick={toggleFavourite}
              className={`custom-player-fav-btn ${player.is_favourite ? 'fav' : ''}`}
              title={player.is_favourite ? "Remove from favourites" : "Add to favourites"}
            >
              {player.is_favourite ? '★' : '☆'}
            </button>
          </div>
          <img
            src={`http://localhost:5000/uploads/players/${player.picture}`}
            alt={`${player.name} ${player.surname}`}
          />
        </div>
        <h2>{player.name} {player.surname}</h2>
        <p><strong>Club: ???</strong>{player.club}</p>
        <p><strong>Position:</strong> {player.position}</p>
        <p>
          <strong>Nationality:</strong> {player.nationality}{' '}
          {countryCode ? (
            <img
              className="custom-player-flag"
              src={`https://flagcdn.com/w40/${countryCode}.png`}
              alt={player.nationality}
              title={player.nationality}
            />
          ) : (
            <span className="team-detail-flag-fallback" title="Unknown country">🌍</span>
          )}
        </p>
        <p><strong>Date of Birth:</strong> {formatDate(player.date_of_birth)}, {getAge(player.date_of_birth)} years</p>
        <p><strong>Value:</strong> {player.value ? `€${formatValue(player.value)}` : '???'}</p>
      </div>

      <div className="team-player-detail-nav-buttons">
        <button>Total Stats</button>
        <button>Club Stats</button>
        <button>County Stats</button>
      </div>
    </div>
  );
};

export default PlayerDetail;

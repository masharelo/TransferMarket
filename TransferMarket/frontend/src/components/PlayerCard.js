import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlayerCard.css';
import countryNameToCode from "../utils/CountryToCode";
import formatValue from '../utils/FormatValue';

const PlayerCard = ({ player, onToggleFavourite }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/players/${player.player_id}`);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleFavourite(player.player_id, player.is_favourite);
  };

  const countryCode = countryNameToCode[player.nationality];

  return (
    <div className="player-card" onClick={handleCardClick}>
      <div className="player-star" onClick={handleStarClick}>
        {player.is_favourite ? '★' : '☆'}
      </div>
      <img
        src={`http://localhost:5000/uploads/players/${player.picture}`}
        alt={`${player.name} ${player.surname}`}
      />
      <h4 className="player-name">
        {player.name} {player.surname}
        {countryCode ? (
          <img
            className="nationality-flag"
            src={`https://flagcdn.com/w40/${countryCode}.png`}
            alt={player.nationality}
            title={player.nationality}
          />
        ) : (
          <span className="nationality-emoji" title="Unknown nationality">🌍</span>
        )}
      </h4>
      <p className="player-club-in-card">{player.current_club || 'No club'}</p>
      <p>{player.position} | €{formatValue(player.value)}</p>
    </div>
  );
};

export default PlayerCard;

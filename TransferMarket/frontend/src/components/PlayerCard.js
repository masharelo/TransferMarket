import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlayerCard.css';

const countryNameToCode = {
  Germany: 'de',
  France: 'fr',
  Brazil: 'br',
  Spain: 'es',
  Italy: 'it',
  Argentina: 'ar',
  England: 'gb-eng',
  Portugal: 'pt',
  Netherlands: 'nl',
  Montenegro: 'me',
  Belgium: 'be',
  "South Korea": 'kr',
  Georgia: 'ge',
  "United States of America": 'us',
  // Other
};

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
      <p>{player.club}</p>
      <p>{player.position}</p>
    </div>
  );
};

export default PlayerCard;

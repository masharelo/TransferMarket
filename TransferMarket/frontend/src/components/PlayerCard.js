import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlayerCard.css';

const PlayerCard = ({ player, onToggleFavourite }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/players/${player.player_id}`);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleFavourite(player.player_id, player.is_favourite);
  };

  return (
    <div className="player-card" onClick={handleCardClick}>
      <div className="player-star" onClick={handleStarClick}>
        {player.is_favourite ? '★' : '☆'}
      </div>
      <img
        src={`http://localhost:5000/uploads/players/${player.picture}`}
        alt={`${player.name} ${player.surname}`}
      />
      <h4>{player.name} {player.surname}</h4>
      <p>{player.club}</p>
      <p>{player.position}</p>
    </div>
  );
};

export default PlayerCard;

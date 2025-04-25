import React from "react";
import { useNavigate } from "react-router-dom";
import "./TeamCard.css";

const TeamCard = ({ team, onToggleFavourite }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/teams/${team.team_id}`);
  };

  return (
    <div className="team-card" onClick={handleCardClick}>
      <span
        className={`star ${team.is_favourite ? "" : "inactive"}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavourite(team.team_id);
        }}
        title={team.is_favourite ? "Remove from favourites" : "Add to favourites"}
      >
        {team.is_favourite ? "★" : "☆"}
      </span>

      <img
        src={`http://localhost:5000/uploads/teams/${team.logo}`}
        alt={`${team.name} logo`}
        className="logo"
      />

      <div className="info">
        <strong>{team.name}</strong> - 📍{team.country}
        {team.city ? `, ${team.city}` : ""} - 🏟️{team.stadium}
      </div>
    </div>
  );
};

export default TeamCard;

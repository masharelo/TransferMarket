import React from "react";
import { useNavigate } from "react-router-dom";

const TeamCard = ({ team, onToggleFavourite }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/teams/${team.team_id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "50%",
        padding: "10px",
        margin: "10px 0",
        border: "1px solid #ccc",
        borderRadius: "8px",
        cursor: "pointer",
        backgroundColor: "#f9f9f9"
      }}
    >
      <span
        onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite(team.team_id);
        }}
        style={{
            fontSize: "28px", // bigger for easier clicking
            color: team.is_favourite ? "gold" : "#ccc", // gold star if fav
            cursor: "pointer",
            marginRight: "10px",
            userSelect: "none"
        }}
        title={team.is_favourite ? "Remove from favourites" : "Add to favourites"}
      >
        {team.is_favourite ? "★" : "☆"}
      </span>

      <img src={`http://localhost:5000/uploads/teams/${team.logo}`} alt={`${team.name} logo`} style={{ height: "40px", margin: "0 10px" }} />
      <div style={{ flex: 1 }}>
        <strong>{team.name}</strong> - 📍{team.country}{team.city ? `, ${team.city}` : ""} - 🏟️{team.stadium}
      </div>
    </div>
  );
};

export default TeamCard;

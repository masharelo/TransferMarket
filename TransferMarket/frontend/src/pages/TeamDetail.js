import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TeamDetail = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/teams/${teamId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTeam(res.data);
      } catch (err) {
        console.error("Failed to fetch team:", err);
      }
    };

    fetchTeam();
  }, [teamId]);

  const toggleFavourite = async () => {
    const token = localStorage.getItem("token");
    try {
      if (team.is_favourite) {
        await axios.delete(`http://localhost:5000/api/auth/favourite_teams/${team.team_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/auth/favourite_teams/${team.team_id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setTeam(prev => ({ ...prev, is_favourite: !prev.is_favourite }));
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  if (!team) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #ccc",
          borderRadius: "12px",
          padding: "20px",
          width: "auto",
          minWidth: "500px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          marginRight: "20px"
        }}>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            marginRight: "40px"
          }}>
            <button
              onClick={toggleFavourite}
              style={{
                fontSize: "28px",
                color: team.is_favourite ? "gold" : "#aaa",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginRight: "10px"
              }}
              title={team.is_favourite ? "Remove from favourites" : "Add to favourites"}
            >
              {team.is_favourite ? "★" : "☆"}
            </button>
            <img
              src={`http://localhost:5000/uploads/teams/${team.logo}`}
              alt={`${team.name} logo`}
              style={{ height: "150px" }}
            />
          </div>

          <div>
            <h1>{team.name}</h1>
            <p><strong>Country:</strong> {team.country}</p>
            {team.city && <p><strong>City:</strong> {team.city}</p>}
            <p><strong>Stadium:</strong> {team.stadium}</p>
            <p><strong>Capacity:</strong> {team.stadium_capacity}</p>
            <p><strong>Founded:</strong> {new Date(team.founded).toLocaleDateString()}</p>
            <p><strong>Squad Value: ???</strong> </p>
          </div>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px"
        }}>
          {["Squad", "Transfers", "Loans", "Contracts", "Competition"].map(label => (
            <button key={label} style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#f5f5f5"
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;

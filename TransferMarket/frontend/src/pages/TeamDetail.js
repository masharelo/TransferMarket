import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './TeamDetail.css';
import countryNameToCode from "../utils/CountryToCode";
import formatDate from "../utils/FormatDate";

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

  if (!team) return <p className="empty-favourites">Loading...</p>;

  const countryCode = countryNameToCode[team.country];

  return (
    <div className="team-detail-wrapper">
      <div className="team-detail-content-box">
        <div className="team-detail-card">
          <div className="team-detail-logo-box">
            <div className="team-detail-logo-wrapper">
              <img
                src={`http://localhost:5000/uploads/teams/${team.logo}`}
                alt={`${team.name} logo`}
                className="team-detail-logo"
              />
            </div>
            <button
              onClick={toggleFavourite}
              className={`team-detail-fav-btn ${team.is_favourite ? "fav" : ""}`}
              title={team.is_favourite ? "Remove from favourites" : "Add to favourites"}
            >
              {team.is_favourite ? "★" : "☆"}
            </button>
          </div>

          <div className="team-detail-info">
            <h1>
              {team.name}
              {countryCode ? (
                <img
                  className="team-detail-flag"
                  src={`https://flagcdn.com/w40/${countryCode}.png`}
                  alt={team.country}
                  title={team.country}
                />
              ) : (
                <span className="team-detail-flag-fallback" title="Unknown country">🌍</span>
              )}
            </h1>
            <p><strong>Country:</strong> {team.country}</p>
            {team.city && <p><strong>City:</strong> {team.city}</p>}
            <p><strong>Stadium:</strong> {team.stadium}</p>
            <p><strong>Capacity:</strong> {team.stadium_capacity}</p>
            <p><strong>Founded:</strong> {formatDate(team.founded)}</p>
            <p><strong>Squad Value: ???</strong></p>
          </div>
        </div>

        <div className="team-player-detail-nav-buttons">
          {["Squad", "Transfers", "Loans", "Contracts", "Competition"].map(label => (
            <button key={label}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;

import React, { useEffect, useState } from "react";
import axios from "axios";
import TeamCard from "../components/TeamCard";
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    const fetchInitialTeams = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/teams?offset=0&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTeams(res.data);
        setOffset(limit);
        if (res.data.length < limit) setHasMore(false);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };

    fetchInitialTeams();
  }, []);

  const fetchMoreTeams = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/auth/teams?offset=${offset}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeams(prev => [...prev, ...res.data]);
      setOffset(prev => prev + limit);
      if (res.data.length < limit) setHasMore(false);
    } catch (err) {
      console.error("Failed to fetch more teams:", err);
    }
  };

  const toggleFavourite = async (teamId) => {
    const token = localStorage.getItem("token");
    const team = teams.find(t => t.team_id === teamId);
    try {
      if (team.is_favourite) {
        await axios.delete(`http://localhost:5000/api/auth/favourite_teams/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/auth/favourite_teams/${teamId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setTeams(prev =>
        prev.map(t => t.team_id === teamId ? { ...t, is_favourite: !t.is_favourite } : t)
      );
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  return (
    <div className="teams-page">
      <h1>⚽ Teams</h1>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {teams.map(team => (
          <TeamCard key={team.team_id} team={team} onToggleFavourite={toggleFavourite} />
        ))}
      </div>
      {hasMore && (
        <div className="load-more-container">
          <button className="LoadMoreButton" onClick={fetchMoreTeams} style={{ marginTop: "20px" }}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Teams;

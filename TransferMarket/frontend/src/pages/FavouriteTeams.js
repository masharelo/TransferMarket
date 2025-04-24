import React, { useEffect, useState } from "react";
import axios from "axios";
import TeamCard from "../components/TeamCard";

const FavouriteTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);

  useEffect(() => {
    const fetchFavourites = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/auth/favourite_teams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to fetch favourites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  useEffect(() => {
    if (!loading && teams.length === 0) {
      const timeout = setTimeout(() => setShowEmptyMessage(true), 500);
      return () => clearTimeout(timeout);
    } else {
      setShowEmptyMessage(false);
    }
  }, [loading, teams]);

  const toggleFavourite = async (teamId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/auth/favourite_teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(prev => prev.filter(team => team.team_id !== teamId));
    } catch (err) {
      console.error("Failed to unfavourite team:", err);
    }
  };

  return (
    <div>
      <h2>Favourite Teams</h2>
      {loading ? (
        <p>Loading teams...</p>
      ) : showEmptyMessage ? (
        <p>You haven't added any favourite teams yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {teams.map(team => (
            <TeamCard
              key={team.team_id}
              team={{ ...team, is_favourite: true }}
              onToggleFavourite={toggleFavourite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouriteTeams;

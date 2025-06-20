import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TeamCard from '../components/TeamCard';
import './FavouriteTeams.css'

const FavouriteTeams = () => {
  const [teams, setTeams] = useState([]);
  const [temporarilyUnfavourited, setTemporarilyUnfavourited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmptyMessage, setShowEmptyMessage] = useState(false);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/favourite_teams', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTeams(res.data);
      } catch (err) {
        console.error('Failed to fetch favourite teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  useEffect(() => {
    let timeout;
    if (!loading && teams.length === 0) {
      timeout = setTimeout(() => setShowEmptyMessage(true), 500);
    } else {
      setShowEmptyMessage(false);
    }

    return () => clearTimeout(timeout);
  }, [loading, teams]);

  const toggleFavourite = async (teamId) => {
    const token = localStorage.getItem('token');

    if (temporarilyUnfavourited.includes(teamId)) {
      try {
        await axios.post(
          `http://localhost:5000/api/auth/favourite_teams/${teamId}`,
          { team_id: teamId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTemporarilyUnfavourited(prev => prev.filter(id => id !== teamId));
      } catch (err) {
        console.error('Failed to re-favourite team:', err);
      }
    } else {
      try {
        await axios.delete(`http://localhost:5000/api/auth/favourite_teams/${teamId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTemporarilyUnfavourited(prev => [...prev, teamId]);
      } catch (err) {
        console.error('Failed to unfavourite team:', err);
      }
    }
  };

  return (
    <div className="favourites-page">
      <h1>⭐ Favourite Teams</h1>
      {loading ? (
        <p>Loading teams...</p>
      ) : teams.length === 0 && showEmptyMessage ? (
        <p>You haven't added any favourite teams yet.</p>
      ) : (
        <div className="teams-grid">
          {teams.map(team => {
            const isUnfavourited = temporarilyUnfavourited.includes(team.team_id);
            return (
              <TeamCard
                key={team.team_id}
                team={{ ...team, is_favourite: !isUnfavourited }}
                onToggleFavourite={toggleFavourite}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavouriteTeams;

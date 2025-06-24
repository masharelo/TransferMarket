import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import TeamCard from "../components/TeamCard";
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({ name: "", country: "" });
  const [sort, setSort] = useState(false);
  const limit = 10;

  const resetRef = useRef(false);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const buildParams = useCallback((currentOffset) => {
    const params = new URLSearchParams();
    params.append("offset", currentOffset);
    params.append("limit", limit);
    if (filters.name) params.append("name", filters.name);
    if (filters.country) params.append("country", filters.country);
    if (sort) params.append("sortBy", "squad_value");
    return params.toString();
  }, [filters, sort]);

  const fetchTeams = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const token = localStorage.getItem("token");
    const currentOffset = reset ? 0 : offsetRef.current;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/auth/teams?${buildParams(currentOffset)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;

      if (reset) {
        setTeams(data);
        offsetRef.current = data.length;
        setHasMore(data.length === limit);
      } else {
        setTeams(prev => [...prev, ...data]);
        offsetRef.current += data.length;
        setHasMore(data.length === limit);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [buildParams, limit]);


  useEffect(() => {
    fetchTeams(true);
  }, [fetchTeams]);

  useEffect(() => {
    if (resetRef.current) {
      resetRef.current = false;
      fetchTeams(true);
    }
  }, [filters, sort, fetchTeams]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      fetchTeams(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    resetRef.current = true;
  };

  const handleSort = () => {
    if (!sort) {
      setSort(true);
      resetRef.current = true;
    }
  };

  const handleReset = () => {
    setFilters({ name: "", country: "" });
    setSort(false);
    resetRef.current = true;
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
      <div className="team-control-buttons">
        <div className="players-filters-wrapper">
          <input
            name="name"
            placeholder="Filter by club name..."
            value={filters.name}
            onChange={handleChange}
            autoComplete="off"
            className="transfers-filter"
          />
          <input
            name="country"
            placeholder="Filter by country..."
            value={filters.country}
            onChange={handleChange}
            autoComplete="off"
            className="transfers-filter"
          />
          <button className="sort-players-button" onClick={handleSort}>Sort by <><br /></>Squad Value</button>
          <button className="sort-players-button" onClick={handleReset}>Reset</button>
        </div>
      </div>

      <div className="team-list">
        {teams.map(team => (
          <TeamCard
            key={team.team_id}
            team={team}
            onToggleFavourite={toggleFavourite}
          />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button
            className="LoadMoreButton"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Teams;

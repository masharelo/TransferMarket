import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditStats.css';
import { useNavigate } from 'react-router-dom';
import isRegularSeason from '../../utils/SeasonChecker';

const EditStats = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [mode, setMode] = useState('new');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [showPlayerSuggestions, setShowPlayerSuggestions] = useState(false);
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    player_id: '',
    team_id: '',
    matches: '',
    goals: '',
    assists: '',
    yellow_cards: '',
    red_cards: '',
    season: '',
  });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/players/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlayers(res.data);
      } catch (err) {}
    };

    const fetchTeams = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/teams', {
          headers: { Authorization: `Bearer ${token}` },
          params: { offset: 0, limit: 10000 },
        });
        setTeams(res.data);
      } catch (err) {}
    };

    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {}
    };

    fetchPlayers();
    fetchTeams();
    fetchStats();
  }, [token]);

  const isFormValid = () => {
    const { player_id, team_id, matches, goals, assists, yellow_cards, red_cards, season } = formData;
    if (!isRegularSeason(season)) {
      alert('Wrong season format! Please enter a valid season (e.g., 2021/2022 or 2021).');
      return false;
    }
    return player_id && team_id && matches !== '' && goals !== '' && assists !== '' && yellow_cards !== '' && red_cards !== '' && season;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['matches', 'goals', 'assists', 'yellow_cards', 'red_cards'];
    if (numericFields.includes(name)) {
      if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      } else if (value.includes('-')) {
        alert(`${name.replace('_', ' ')} cannot be negative`);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedPlayer = players.find((p) => p.player_id === formData.player_id);
    const selectedTeam = teams.find((t) => t.team_id === formData.team_id);
    if (!selectedPlayer) {
      alert('Invalid player name!');
      return;
    }
    if (!selectedTeam) {
      alert('Invalid team name!');
      return;
    }
    if (!isFormValid()) return;
    try {
      await axios.post('http://localhost:5000/api/admin/add_stats', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {}
  };

  const handleEditClick = (stat) => {
    setSelectedStat(stat);
    setFormData({
      player_id: stat.player_id,
      team_id: stat.team_id,
      matches: stat.matches,
      goals: stat.goals,
      assists: stat.assists,
      yellow_cards: stat.yellow_cards,
      red_cards: stat.red_cards,
      season: stat.season,
    });
    const selectedPlayer = players.find((p) => p.player_id === stat.player_id);
    setPlayerSearch(selectedPlayer ? `${selectedPlayer.name} ${selectedPlayer.surname}` : '');
    const selectedTeam = teams.find((t) => t.team_id === stat.team_id);
    setTeamSearch(selectedTeam ? selectedTeam.name : '');
    setShowPlayerSuggestions(false);
    setShowTeamSuggestions(false);
    setMode('edit');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const selectedPlayer = players.find((p) => p.player_id === formData.player_id);
    const selectedTeam = teams.find((t) => t.team_id === formData.team_id);
    if (!selectedPlayer) {
      alert('Invalid player name!');
      return;
    }
    if (!selectedTeam) {
      alert('Invalid team name!');
      return;
    }
    if (!isFormValid()) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/stats/${selectedStat.stat_id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {}
  };

  const handleDelete = async (statId) => {
    if (!window.confirm('Are you sure you want to delete this stat?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/stats/${statId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(stats.filter((s) => s.stat_id !== statId));
    } catch (err) {}
  };

  const handlePlayerSelect = (player) => {
    setFormData((prev) => ({ ...prev, player_id: player.player_id }));
    setPlayerSearch(`${player.name} ${player.surname}`);
    setShowPlayerSuggestions(false);
  };

  const handleTeamSelect = (team) => {
    setFormData((prev) => ({ ...prev, team_id: team.team_id }));
    setTeamSearch(team.name);
    setShowTeamSuggestions(false);
  };

  const filteredPlayerSuggestions = players
    .filter((p) => `${p.name} ${p.surname}`.toLowerCase().includes(playerSearch.toLowerCase()))
    .slice(0, 3);

  const filteredTeamSuggestions = teams
    .filter((t) => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
    .slice(0, 3);

  const filteredStats = stats.filter((s) => `${s.name} ${s.surname}`.toLowerCase().includes(filterName.toLowerCase()));

  return (
    <div className="editstats-container">
      <div className="editstats-sidebar">
        <button
          onClick={() => {
            setMode('new');
            setSelectedStat(null);
            setFormData({
              player_id: '',
              team_id: '',
              matches: '',
              goals: '',
              assists: '',
              yellow_cards: '',
              red_cards: '',
              season: '',
            });
            setPlayerSearch('');
            setTeamSearch('');
            setShowPlayerSuggestions(false);
            setShowTeamSuggestions(false);
          }}
          className="edit-buttons"
        >
          New Stat
        </button>
        <button
          onClick={() => {
            setMode('edit_delete');
            setSelectedStat(null);
            setShowPlayerSuggestions(false);
            setShowTeamSuggestions(false);
          }}
          className="edit-buttons"
        >
          Edit/Delete
        </button>
      </div>

      {(mode === 'new' || (mode === 'edit' && selectedStat)) && (
        <form className="editstats-form" onSubmit={mode === 'new' ? handleSubmit : handleUpdate}>
          <input
            type="text"
            placeholder="Player"
            value={playerSearch}
            onChange={(e) => {
              setPlayerSearch(e.target.value);
              setFormData((prev) => ({ ...prev, player_id: '' }));
              setShowPlayerSuggestions(true);
            }}
            required
          />
          {showPlayerSuggestions && playerSearch && filteredPlayerSuggestions.length > 0 && (
            <ul className="edittransfers-dropdown">
              {filteredPlayerSuggestions.map((p) => (
                <li key={p.player_id} onClick={() => handlePlayerSelect(p)}>
                  {p.name} {p.surname} ({p.date_of_birth.split('T')[0]})
                </li>
              ))}
            </ul>
          )}

          <input
            type="text"
            placeholder="Team"
            value={teamSearch}
            onChange={(e) => {
              setTeamSearch(e.target.value);
              setFormData((prev) => ({ ...prev, team_id: '' }));
              setShowTeamSuggestions(true);
            }}
            required
          />
          {showTeamSuggestions && teamSearch && filteredTeamSuggestions.length > 0 && (
            <ul className="edittransfers-dropdown">
              {filteredTeamSuggestions.map((t) => (
                <li key={t.team_id} onClick={() => handleTeamSelect(t)}>
                  {t.name}
                </li>
              ))}
            </ul>
          )}

          <input type="number" name="matches" placeholder="Matches" value={formData.matches} onChange={handleInputChange} required />
          <input type="number" name="goals" placeholder="Goals" value={formData.goals} onChange={handleInputChange} required />
          <input type="number" name="assists" placeholder="Assists" value={formData.assists} onChange={handleInputChange} required />
          <input type="number" name="yellow_cards" placeholder="Yellow Cards" value={formData.yellow_cards} onChange={handleInputChange} required />
          <input type="number" name="red_cards" placeholder="Red Cards" value={formData.red_cards} onChange={handleInputChange} required />
          <input type="text" name="season" placeholder="Season (e.g., 2021/2022)" value={formData.season} onChange={handleInputChange} required />

          <div className="edit-info-buttons">
            <button type="submit">{mode === 'new' ? 'Create Stat' : 'Update Stat'}</button>
          </div>
        </form>
      )}

      {mode === 'edit_delete' && (
        <div className="editstats-list">
          <input
            type="text"
            placeholder="Filter by player name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="editstats-filter"
          />
          {filteredStats.length === 0 ? (
            <p className="no-info-message">No stats found for that player.</p>
          ) : (
            <div className="editstats-grid">
              {filteredStats.map((stat) => {
                const team = teams.find((t) => t.team_id === stat.team_id);
                return (
                  <div key={stat.stat_id} className="editstats-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/players/${stat.player_id}`)}>
                    <h3 className="editstats-name">{stat.name} {stat.surname}</h3>
                    <p className="editstats-details">
                      <span style={{ color: 'aqua', fontSize: '20px' }}>{stat.season}</span> <br />
                      <span style={{ color: 'lime', fontSize: '20px' }}>{team ? team.name : 'Unknown'}</span><br /><br />
                      Matches: {stat.matches}<br />
                      Goals: {stat.goals}<br />
                      Assists: {stat.assists}<br />
                      <span style={{ color: 'yellow' }}>Yellow Cards: {stat.yellow_cards}</span><br />
                      <span style={{ color: 'red' }}>Red Cards: {stat.red_cards}</span><br />
                    </p>
                    <div className="edit-info-buttons" onClick={(e) => e.stopPropagation()}>
                      <button className="editpost-action-button" onClick={() => handleEditClick(stat)}>Edit</button>
                      <button className="editpost-action-button" onClick={() => handleDelete(stat.stat_id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditStats;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EditTeams.css';
import formatDate from '../../utils/FormatDate';
import isRegularDate from '../../utils/IsRegularDate';

const EditTeams = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [mode, setMode] = useState('new');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    stadium: '',
    stadium_capacity: '',
    founded: '',
    type: 'club',
    logo: null,
  });

  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/teams', {
          headers: { Authorization: `Bearer ${token}` },
          params: { offset: 0, limit: 10000 },
        });
        setTeams(res.data);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };
    fetchAllTeams();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'stadium_capacity' && value < 0) {
      alert('Value cannot be negative.');
      return;
    }
    if (name === 'logo') {
      setFormData((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isFormValid = () => {
    const { name, city, country, stadium, stadium_capacity, founded, type } = formData;
    return name && city && country && stadium && stadium_capacity && founded && type;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Please fill out all required fields.');
      return;
    }
    if (!isRegularDate(formData.founded)) {
      alert('Please enter a valid date.');
      return;
    }
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) data.append(key, val);
    });
    data.append('folder', 'teams');
    try {
      await axios.post('http://localhost:5000/api/admin/add_team?folder=teams', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      console.error('Error creating team:', err);
    }
  };

  const handleEditClick = (team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      city: team.city,
      country: team.country,
      stadium: team.stadium,
      stadium_capacity: team.stadium_capacity,
      founded: team.founded.split('T')[0],
      type: team.type,
      logo: null,
    });
    setMode('edit');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Please fill out all required fields.');
      return;
    }
    if (!isRegularDate(formData.founded)) {
      alert('Please enter a valid date.');
      return;
    }
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key !== 'logo' || val) data.append(key, val);
    });
    data.append('folder', 'teams');
    try {
      await axios.put(`http://localhost:5000/api/admin/teams/${selectedTeam.team_id}?folder=teams`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      console.error('Error updating team:', err);
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(teams.filter(t => t.team_id !== teamId));
    } catch (err) {
      console.error('Error deleting team:', err);
    }
  };

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <div className="editteam-container">
      <div className="editteam-sidebar">
        <button
          onClick={() => {
            setMode('new');
            setSelectedTeam(null);
            setFormData({
              name: '',
              city: '',
              country: '',
              stadium: '',
              stadium_capacity: '',
              founded: '',
              type: 'club',
              logo: null,
            });
          }}
          className="edit-buttons"
        >
          New Team
        </button>
        <button
          onClick={() => {
            setMode('edit_delete');
            setSelectedTeam(null);
          }}
          className="edit-buttons"
        >
          Edit/Delete
        </button>
      </div>

      {mode === 'new' && (
        <form className="editteam-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required/>
          <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} required/>
          <input type="text" name="stadium" placeholder="Stadium" value={formData.stadium} onChange={handleInputChange} required/>
          <input type="number" name="stadium_capacity" placeholder="Stadium Capacity" value={formData.stadium_capacity} onChange={handleInputChange} required/>
          <input type="date" name="founded" value={formData.founded} onChange={handleInputChange} required/>
          <select name="type" value={formData.type} onChange={handleInputChange} required>
            <option value="club">Club</option>
            <option value="national">National</option>
          </select>
          <input type="file" name="logo" onChange={handleInputChange} accept="image/*" />
          <div className="edit-info-buttons">
            <button type="submit">Create Team</button>
          </div>
        </form>
      )}

      {mode === 'edit_delete' && (
        <div className="editteam-teams">
          <input
            type="text"
            placeholder="Filter by name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="editteams-filter"
          />
          {filteredTeams.length === 0 ? (
            <p className="no-info-message">No teams with similar name.</p>
          ) : (
            <div className="editteam-grid">
              {filteredTeams.map((team) => (
                <div
                  key={team.team_id}
                  className="editteam-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/teams/${team.team_id}`)}
                >
                  <h3 className="editteam-name">{team.name}</h3>
                  <img src={`http://localhost:5000/uploads/teams/${team.logo}`} alt="logo" className="editteam-logo" />
                  <p className="editteam-details">{team.city}, {team.country}<br />{team.stadium} ({team.stadium_capacity})</p>
                  <small className="editteam-meta">Founded: {formatDate(team.founded)}</small>
                  <div className="edit-info-buttons" onClick={(e) => e.stopPropagation()}>
                    <button className="editpost-action-button" onClick={() => handleEditClick(team)}>Edit</button>
                    <button className="editpost-action-button" onClick={() => handleDelete(team.team_id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && selectedTeam && (
        <form className="editteam-form" onSubmit={handleUpdate}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required/>
          <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} required/>
          <input type="text" name="stadium" placeholder="Stadium" value={formData.stadium} onChange={handleInputChange} required/>
          <input type="number" name="stadium_capacity" placeholder="Stadium Capacity" value={formData.stadium_capacity} onChange={handleInputChange} required/>
          <input type="date" name="founded" value={formData.founded} onChange={handleInputChange} required/>
          <select name="type" value={formData.type} onChange={handleInputChange} required>
            <option value="club">Club</option>
            <option value="national">National</option>
          </select>
          <input type="file" name="logo" onChange={handleInputChange} accept="image/*" />
          <div className="edit-info-buttons">
            <button type="submit">Update Team</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditTeams;

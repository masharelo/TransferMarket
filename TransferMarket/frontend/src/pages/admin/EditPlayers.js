import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EditPlayers.css';
import formatDate from '../../utils/FormatDate';
import isRegularDate from '../../utils/IsRegularDate';
import formatValue from '../../utils/FormatValue';

const EditPlayers = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [mode, setMode] = useState('new');
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    date_of_birth: '',
    position: '',
    nationality: '',
    value: '',
    picture: null,
  });

  useEffect(() => {
    const fetchAllPlayers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/players', {
          headers: { Authorization: `Bearer ${token}` },
          params: { offset: 0, limit: 10000 },
        });
        setPlayers(res.data);
      } catch (err) {
        console.error('Error fetching players:', err);
      }
    };
    fetchAllPlayers();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'value' && value < 0) {
      alert('Value cannot be negative.');
      return;
    }
    if (name === 'picture') {
      setFormData((prev) => ({ ...prev, picture: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isFormValid = () => {
    const { name, surname, date_of_birth, position, nationality, value } = formData;
    return name && surname && date_of_birth && position && nationality && value !== '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Please fill out all required fields.');
      return;
    }
    if (!isRegularDate(formData.date_of_birth)) {
      alert('Please enter a valid date.');
      return;
    }
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) data.append(key, val);
    });
    data.append('folder', 'players');
    try {
      await axios.post('http://localhost:5000/api/admin/add_player?folder=players', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      console.error('Error creating player:', err);
    }
  };

  const handleEditClick = (player) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      surname: player.surname,
      date_of_birth: player.date_of_birth.split('T')[0],
      position: player.position,
      nationality: player.nationality,
      value: player.value,
      picture: null,
    });
    setMode('edit');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Please fill out all required fields.');
      return;
    }
    if (!isRegularDate(formData.date_of_birth)) {
      alert('Please enter a valid date.');
      return;
    }
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key !== 'picture' || val) data.append(key, val);
    });
    data.append('folder', 'players');
    try {
      await axios.put(`http://localhost:5000/api/admin/players/${selectedPlayer.player_id}?folder=players`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      console.error('Error updating player:', err);
    }
  };

  const handleDelete = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/players/${playerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers(players.filter(p => p.player_id !== playerId));
    } catch (err) {
      console.error('Error deleting player:', err);
    }
  };

  const filteredPlayers = players.filter(p =>
    `${p.name} ${p.surname}`.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <div className="editplayer-container">
      <div className="editplayer-sidebar">
        <button
          onClick={() => {
            setMode('new');
            setSelectedPlayer(null);
            setFormData({
              name: '',
              surname: '',
              date_of_birth: '',
              position: '',
              nationality: '',
              value: '',
              picture: null,
            });
          }}
          className="edit-buttons"
        >
          New Player
        </button>
        <button
          onClick={() => {
            setMode('edit_delete');
            setSelectedPlayer(null);
          }}
          className="edit-buttons"
        >
          Edit/Delete
        </button>
      </div>

      {mode === 'new' && (
        <form className="editplayer-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
          <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleInputChange} required />
          <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} required />
          <input type="text" name="position" placeholder="Position" value={formData.position} onChange={handleInputChange} required />
          <input type="text" name="nationality" placeholder="Nationality (Country name)" value={formData.nationality} onChange={handleInputChange} required />
          <input type="number" name="value" placeholder="Value (€)" value={formData.value} onChange={handleInputChange} required />
          <input type="file" name="picture" onChange={handleInputChange} accept="image/*" />
          <div className="edit-info-buttons">
            <button type="submit">Create Player</button>
          </div>
        </form>
      )}

      {mode === 'edit_delete' && (
        <div className="editplayer-players">
          <input
            type="text"
            placeholder="Filter by name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="editplayers-filter"
          />
          {filteredPlayers.length === 0 ? (
            <p className="no-info-message">No players with similar name.</p>
          ) : (
            <div className="editplayer-grid">
              {filteredPlayers.map((player) => (
                <div
                  key={player.player_id}
                  className="editplayer-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/players/${player.player_id}`)}
                >
                  <h3 className="editplayer-name">{player.name} {player.surname}</h3>
                  <img src={`http://localhost:5000/uploads/players/${player.picture}`} alt="pic" className="editplayer-pic" />
                  <p className="editplayer-details">
                    {player.position} - {player.nationality}<br />
                    €{formatValue(player.value)}
                  </p>
                  <small className="editplayer-meta">Born: {formatDate(player.date_of_birth)}</small>
                  <div className="edit-info-buttons" onClick={(e) => e.stopPropagation()}>
                    <button className="editpost-action-button" onClick={() => handleEditClick(player)}>Edit</button>
                    <button className="editpost-action-button" onClick={() => handleDelete(player.player_id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && selectedPlayer && (
        <form className="editplayer-form" onSubmit={handleUpdate}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
          <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleInputChange} required />
          <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} required />
          <input type="text" name="position" placeholder="Position" value={formData.position} onChange={handleInputChange} required />
          <input type="text" name="nationality" placeholder="Nationality (Country name)" value={formData.nationality} onChange={handleInputChange} required />
          <input type="number" name="value" placeholder="Value (€)" value={formData.value} onChange={handleInputChange} required />
          <input type="file" name="picture" onChange={handleInputChange} accept="image/*" />
          <div className="edit-info-buttons">
            <button type="submit">Update Player</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditPlayers;

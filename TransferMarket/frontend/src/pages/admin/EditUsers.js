import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditUsers.css';

const EditUsers = () => {
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [token]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const handleAddAdmin = async (userId) => {
    if (window.confirm('Are you sure you want to upgrade this user to admin?')) {
      try {
        const res = await axios.patch(
          `http://localhost:5000/api/admin/users/${userId}/make-admin`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('User upgraded to admin!');
        setUsers(res.data);
      } catch (err) {
        console.error('Error upgrading user:', err);
        alert('Failed to upgrade user');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUsers(users.filter((user) => user.user_id !== userId));
        alert('User deleted!');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(filter)
  );

  return (
    <div className="editusers-container">
      <div className="editusers-sidebar">
        <input
          type="text"
          className="editusers-filter"
          placeholder="Search by username..."
          value={filter}
          onChange={handleFilterChange}
        />
      </div>
      <div className="editusers-form">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Manage Users 👤</h2>
        {loading ? (
          <p className='empty-favourites'>Loading users...</p>
        ) : (
          <div className="editusers-grid">
            {filteredUsers.map((user) => (
              <div key={user.user_id} className="editusers-card">
                <div className="editusers-name">
                  <img
                    src={`http://localhost:5000/uploads/users/${user.pfp || 'basic.jpeg'}`}
                    alt={user.username}
                    className="editusers-pfp"
                  />
                  {user.username}
                </div>
                <div className="editusers-details">{user.email}</div>
                <div className="edit-info-buttons">
                  <button
                    className="editusers-confirm-button"
                    onClick={() => handleAddAdmin(user.user_id)}
                  >
                    <span style={{ color: 'aqua' }}>Add Admin</span>
                  </button>
                  <button
                    className="editusers-confirm-button"
                    onClick={() => handleDeleteUser(user.user_id)}
                  >
                    <span style={{ color: 'red' }}>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUsers;

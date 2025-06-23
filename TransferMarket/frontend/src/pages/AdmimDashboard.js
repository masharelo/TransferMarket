import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError('You are not authorized to see this');
        } else {
          setError('An unexpected error occurred');
          console.error(err);
        }
      }
    };
    fetchUsers();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Admin Dashboard - Users</h1>
      <ul>
        {users.map((u) => (
          <li key={u.user_id}>{u.username} ({u.is_admin ? 'Admin' : 'User'})</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;

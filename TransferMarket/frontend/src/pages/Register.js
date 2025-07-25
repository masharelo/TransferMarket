import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './LoginRegister.css';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    name: '',
    surname: '',
    email: '',
    dob: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>TransferMarket</h1>
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" onChange={handleChange} required autoComplete="off" />
          <input name="name" placeholder="First Name" onChange={handleChange} required autoComplete="off" />
          <input name="surname" placeholder="Last Name" onChange={handleChange} required autoComplete="off" />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required autoComplete="off" />
          <input name="dob" type="date" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit">Register</button>
        </form>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;

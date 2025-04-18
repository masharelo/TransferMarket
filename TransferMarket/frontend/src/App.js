import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Transfers from './pages/Transfers';
import Favourites from './pages/Favourites';
import Players from './pages/Players';
import Teams from './pages/Teams';
import MyProfile from './pages/MyProfile';
import Layout from './components/Layout'; 
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isLoggedIn ? '/home' : '/login'} />} />
      <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>} />
      <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
      <Route path="/home" element={<PrivateRoute> <Layout> <Home /> </Layout> </PrivateRoute>} />
      <Route path="/transfers" element={<PrivateRoute> <Layout> <Transfers /> </Layout> </PrivateRoute>} />
      <Route path="/favourites" element={<PrivateRoute> <Layout> <Favourites /> </Layout> </PrivateRoute>} />
      <Route path="/players" element={<PrivateRoute> <Layout> <Players /> </Layout> </PrivateRoute>} />
      <Route path="/teams" element={<PrivateRoute> <Layout> <Teams /> </Layout> </PrivateRoute>} />
      <Route path="/myprofile" element={<PrivateRoute> <Layout> <MyProfile /> </Layout> </PrivateRoute>} />
    </Routes>
  );
}

export default App;

import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Transfers from './pages/Transfers';
import FavouritePlayers from './pages/FavouritePlayers';
import FavouriteTeams from './pages/FavouriteTeams';
import Players from './pages/Players';
import Teams from './pages/Teams';
import MyProfile from './pages/MyProfile';
import PostDetail from './pages/PostDetail';
import TeamDetail from './pages/TeamDetail';
import PlayerDetail from './pages/PlayerDetail';
import Layout from './components/Layout'; 
import NotAuthorized from './pages/NotAuthorized';
import AdminDashboard from './pages/AdmimDashboard';
import AdminRoute from './routes/AdminRoute';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

function App() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isLoggedIn ? '/home' : '/login'} />} />
      <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>} />
      <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
      <Route path="/home" element={<PrivateRoute> <Layout> <Home /> </Layout> </PrivateRoute>} />
      <Route path="/transfers" element={<PrivateRoute> <Layout> <Transfers /> </Layout> </PrivateRoute>} />
      <Route path="/favourite_players" element={<PrivateRoute> <Layout> <FavouritePlayers /> </Layout> </PrivateRoute>} />
      <Route path="/favourite_teams" element={<PrivateRoute> <Layout> <FavouriteTeams /> </Layout> </PrivateRoute>} />
      <Route path="/players" element={<PrivateRoute> <Layout> <Players /> </Layout> </PrivateRoute>} />
      <Route path="/teams" element={<PrivateRoute> <Layout> <Teams /> </Layout> </PrivateRoute>} />
      <Route path="/myprofile" element={<PrivateRoute> <Layout> <MyProfile /> </Layout> </PrivateRoute>} />
      <Route path="/post/:postId" element={<PrivateRoute> <Layout> <PostDetail /> </Layout> </PrivateRoute>} />
      <Route path="/teams/:teamId" element={<PrivateRoute> <Layout> <TeamDetail /> </Layout> </PrivateRoute>} />
      <Route path="/players/:playerId" element={<PrivateRoute> <Layout> <PlayerDetail /> </Layout> </PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute> <Layout> <AdminDashboard /> </Layout> </AdminRoute>} />
      <Route path="/not-authorized" element={<NotAuthorized/>} />
    </Routes>
  );
}

export default App;

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useContext(AuthContext);

  return isLoggedIn && user?.is_admin
    ? children
    : <Navigate to="/not-authorized" />;
};

export default AdminRoute;

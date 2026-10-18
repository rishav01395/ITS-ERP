import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  let user;

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (!token || !user || typeof user !== 'object') {
    return <Navigate to="/login" replace />;
  }

  const role = typeof user.role === 'string' ? user.role.toLowerCase() : '';
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
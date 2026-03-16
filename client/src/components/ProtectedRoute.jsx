import React from 'react';
import { Navigate } from 'react-router-dom';

// Verificamos si hay un usuario logueado usando localStorage temporalmente
// En un caso real, el token JWT o la sesión la validaríamos con el backend
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  
  if (!user) {
    // Si no está logueado, redirigir al Login
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, renderizar el componente hijo (Dashboard, etc.)
  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const ProtectedRoutes: React.FC = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    // Optionally, render a loading indicator while checking authentication
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
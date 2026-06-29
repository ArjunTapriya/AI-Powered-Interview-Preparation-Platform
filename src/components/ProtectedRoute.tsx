import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../store/AppContext";

interface ProtectedRouteProps {
  redirectTo?: string;
}

/**
 * Wraps protected routes. Redirects to /auth if user is not logged in.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectTo = "/auth",
}) => {
  const { user, accessToken } = useApp();

  if (!user.isLoggedIn || !accessToken) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

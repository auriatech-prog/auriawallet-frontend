import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando sesión...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/wallet" replace />;
  }

  return <Outlet />;
}

import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const redirectToWallet = () => {
      navigate("/wallet", { replace: true });
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        redirectToWallet();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", redirectToWallet);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", redirectToWallet);
    };
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return <div>Cargando sesión...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/wallet" replace />;
  }

  return <Outlet />;
}

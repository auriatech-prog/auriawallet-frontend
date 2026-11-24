import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-auria-border bg-auria-cream px-5 py-3.5">
      <Link
        to="/wallet"
        className="inline-flex items-center gap-2 text-auria-ink no-underline"
        aria-label="AuriaWallet Inicio"
      >
        <span className="inline-flex items-center gap-1" aria-hidden="true">
          <i className="block h-4.5 w-1.5 -skew-x-18 rounded-xs bg-auria-lime" />
          <i className="block h-4.5 w-1.5 -skew-x-18 rounded-xs bg-auria-lime" />
        </span>
        <span className="text-lg font-bold tracking-tight">AuriaWallet</span>
      </Link>

      <div className="flex items-center gap-2.5">
        {user && (
          <span className="text-xs font-medium text-auria-muted">
            {user.name}
          </span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
        >
          Salir
        </button>
      </div>
    </header>
  );
}

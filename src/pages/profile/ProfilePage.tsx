import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, Card } from "@/components/ui";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { useAuth } from "@/hooks/useAuth";
import type { CurrencyCode } from "@/types/wallet";

const AUTH_STORAGE_KEY = "auria_wallet_auth";

const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "Dólar estadounidense",
  EUR: "Euro",
  ARS: "Peso argentino",
};

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>("ARS");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.name?.trim() || "Usuario Auria";
  const displayEmail = user?.email?.trim() || "cuenta@auriawallet.app";
  const usernameHandle =
    displayEmail.split("@")[0]?.trim() ||
    displayName.toLowerCase().replace(/\s+/g, ".");
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setDefaultCurrency(currency);
    setStatusMessage(`Moneda principal seleccionada: ${currency}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await Promise.resolve(logout());
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-110 space-y-4">
      <section aria-labelledby="profile-heading">
        <h1
          id="profile-heading"
          className="font-display text-2xl font-bold tracking-tight text-auria-ink"
        >
          Perfil
        </h1>
      </section>

      {/* Cabecera de cuenta */}
      <section
        aria-label="Datos de la cuenta"
        className="relative overflow-hidden rounded-3xl bg-auria-forest p-5 text-white shadow-md"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -bottom-12 h-32 w-44 rounded-full bg-auria-lime/25 blur-xs"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -bottom-14 h-28 w-36 rounded-full bg-auria-lime/80"
        />

        <div className="relative z-10 flex items-center gap-3.5">
          <div
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-auria-lime text-lg font-extrabold text-auria-forest shadow-xs"
          >
            {initials || "AW"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold tracking-tight text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-white/85">{displayEmail}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-auria-lime">
              Cuenta activa
            </span>
          </div>
        </div>
      </section>

      {/* Preferencias de moneda */}
      <section aria-labelledby="preferences-heading" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2
            id="preferences-heading"
            className="text-base font-bold text-auria-ink"
          >
            Preferencias de billetera
          </h2>
          <span className="rounded-full bg-auria-lime/30 px-2.5 py-0.5 text-xs font-semibold text-auria-forest tabular-nums">
            {defaultCurrency}
          </span>
        </div>

        <Card className="space-y-2.5 rounded-2xl border border-auria-border bg-auria-card p-3.5 shadow-2xs">
          <p className="text-xs font-medium text-auria-muted">
            Moneda de referencia
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SUPPORTED_CURRENCIES.map((currency) => {
              const isSelected = defaultCurrency === currency;
              return (
                <button
                  key={currency}
                  type="button"
                  onClick={() => handleCurrencyChange(currency)}
                  aria-pressed={isSelected}
                  className={`flex cursor-pointer flex-col items-start rounded-xl border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest ${
                    isSelected
                      ? "border-auria-forest bg-auria-lime/30 text-auria-forest"
                      : "border-auria-border bg-white text-auria-ink hover:bg-auria-cream"
                  }`}
                >
                  <span className="text-sm font-bold tabular-nums">
                    {currency}
                  </span>
                  <span className="line-clamp-1 text-[11px] text-auria-muted">
                    {CURRENCY_LABELS[currency]}
                  </span>
                </button>
              );
            })}
          </div>

          {statusMessage && (
            <p
              role="status"
              aria-live="polite"
              className="pt-1 text-xs font-medium text-auria-forest"
            >
              {statusMessage}
            </p>
          )}
        </Card>
      </section>

      {/* Información y acciones de sesión */}
      <section
        aria-labelledby="account-actions-heading"
        className="space-y-2.5"
      >
        <h2
          id="account-actions-heading"
          className="text-base font-bold text-auria-ink"
        >
          Sesión y seguridad
        </h2>

        <Card className="space-y-3 rounded-2xl border border-auria-border bg-auria-card p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-auria-muted">Usuario</span>
            <span className="truncate font-semibold text-auria-ink">
              {usernameHandle}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-auria-muted">Contraseña</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-wider text-auria-ink tabular-nums">
                {isPasswordVisible ? "•••••••••••• (oculta)" : "••••••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                aria-pressed={isPasswordVisible}
                className="cursor-pointer rounded-lg bg-auria-lime/30 px-2 py-0.5 text-[11px] font-semibold text-auria-forest transition hover:bg-auria-lime/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
              >
                {isPasswordVisible ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            isLoading={isLoggingOut}
            onClick={() => void handleLogout()}
            className="mt-2 min-h-11 w-full rounded-xl border border-red-200 bg-red-50/70 text-sm font-bold text-red-700 transition hover:bg-red-100/80"
          >
            Cerrar sesión
          </Button>
        </Card>
      </section>
    </div>
  );
}

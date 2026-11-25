import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const AUTH_STORAGE_KEY = "auria_wallet_auth";

type ProfileSectionKey =
  | "edit"
  | "personal"
  | "security"
  | "limits"
  | "notifications"
  | "help"
  | null;

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-auria-ink"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function HelpCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<ProfileSectionKey>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.name?.trim() || "Usuario Auria";
  const displayEmail = user?.email?.trim() || "cuenta@auriawallet.app";

  const toggleSection = (section: Exclude<ProfileSectionKey, null>) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/wallet");
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
    <div className="mx-auto w-full max-w-110 space-y-5 pb-2">
      {/* Encabezado superior */}
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Volver"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-auria-ink transition hover:bg-auria-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="font-display text-xl font-bold tracking-tight text-auria-ink">
            Mi perfil
          </h1>
        </div>

        <button
          type="button"
          onClick={() => toggleSection("help")}
          aria-label="Centro de ayuda"
          aria-expanded={activeSection === "help"}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-auria-border/70 bg-auria-card text-auria-ink shadow-2xs transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
        >
          <HelpCircleIcon />
        </button>
      </header>

      {/* Tarjeta principal de identidad */}
      <section
        aria-label="Resumen del perfil"
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

        <div className="relative z-10">
          <div className="space-y-1">
            <p className="truncate text-2xl font-bold tracking-tight text-white">
              {displayName}
            </p>
            <p className="truncate text-sm text-white/80">{displayEmail}</p>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-auria-lime px-3.5 py-1.5 text-xs font-bold text-auria-forest">
              <CheckIcon />
              Cuenta verificada
            </span>
          </div>

          {activeSection === "edit" && (
            <div className="mt-4 rounded-2xl bg-white/10 p-3.5 text-xs text-white/90">
              <p className="font-semibold text-auria-lime">Edición de perfil</p>
              <p className="mt-1 leading-relaxed text-white/85">
                Tus datos principales están sincronizados con tu cuenta de
                AuriaWallet ({displayEmail}).
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Sección Mi cuenta */}
      <section aria-labelledby="my-account-heading" className="space-y-2.5">
        <h2
          id="my-account-heading"
          className="text-base font-bold tracking-tight text-auria-ink"
        >
          Mi cuenta
        </h2>

        <div className="overflow-hidden rounded-3xl border border-auria-border/70 bg-auria-card shadow-2xs">
          {/* Datos personales */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("personal")}
              aria-expanded={activeSection === "personal"}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-auria-cream/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-auria-forest"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-auria-ink">
                  Datos personales
                </p>
                <p className="mt-0.5 text-xs text-auria-muted">
                  Nombre, DNI y datos de contacto
                </p>
              </div>
              <ChevronRightIcon />
            </button>

            {activeSection === "personal" && (
              <div className="space-y-1.5 border-t border-auria-border/60 bg-auria-cream/40 px-4 py-3 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-auria-muted">Nombre completo</span>
                  <span className="font-semibold text-auria-ink">
                    {displayName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-auria-muted">Email</span>
                  <span className="font-semibold text-auria-ink">
                    {displayEmail}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mx-4 border-t border-auria-border/70" />

          {/* Seguridad */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("security")}
              aria-expanded={activeSection === "security"}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-auria-cream/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-auria-forest"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-auria-ink">Seguridad</p>
                <p className="mt-0.5 text-xs text-auria-muted">
                  Contraseña y métodos de acceso
                </p>
              </div>
              <ChevronRightIcon />
            </button>

            {activeSection === "security" && (
              <div className="space-y-1.5 border-t border-auria-border/60 bg-auria-cream/40 px-4 py-3 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-auria-muted">Método de acceso</span>
                  <span className="font-semibold text-auria-ink">
                    Email y contraseña
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-auria-muted">Estado de sesión</span>
                  <span className="font-semibold text-auria-forest">
                    Protegida
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mx-4 border-t border-auria-border/70" />

          {/* Límites de operación */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("limits")}
              aria-expanded={activeSection === "limits"}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-auria-cream/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-auria-forest"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-auria-ink">
                  Límites de operación
                </p>
                <p className="mt-0.5 text-xs text-auria-muted">
                  Consultá tus límites disponibles
                </p>
              </div>
              <ChevronRightIcon />
            </button>

            {activeSection === "limits" && (
              <div className="space-y-1.5 border-t border-auria-border/60 bg-auria-cream/40 px-4 py-3 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-auria-muted">Monedas habilitadas</span>
                  <span className="font-semibold text-auria-ink">
                    ARS · USD · EUR
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-auria-muted">Nivel de cuenta</span>
                  <span className="font-semibold text-auria-forest">
                    Verificada sin restricciones
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sección Preferencias y ayuda */}
      <section
        aria-labelledby="preferences-help-heading"
        className="space-y-2.5"
      >
        <h2
          id="preferences-help-heading"
          className="text-base font-bold tracking-tight text-auria-ink"
        >
          Preferencias y ayuda
        </h2>

        <div className="overflow-hidden rounded-3xl border border-auria-border/70 bg-auria-card shadow-2xs">
          {/* Notificaciones */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("notifications")}
              aria-expanded={activeSection === "notifications"}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-auria-cream/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-auria-forest"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-auria-ink">
                  Notificaciones
                </p>
                <p className="mt-0.5 text-xs text-auria-muted">
                  Elegí qué novedades querés recibir
                </p>
              </div>
              <ChevronRightIcon />
            </button>

            {activeSection === "notifications" && (
              <div className="flex items-center justify-between gap-3 border-t border-auria-border/60 bg-auria-cream/40 px-4 py-3 text-xs">
                <span className="font-medium text-auria-ink">
                  Alertas de movimientos y cotizaciones
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationsEnabled}
                  onClick={() => setNotificationsEnabled((prev) => !prev)}
                  className={`cursor-pointer rounded-full px-3 py-1 font-bold transition ${
                    notificationsEnabled
                      ? "bg-auria-forest text-auria-lime"
                      : "border border-auria-border bg-white text-auria-muted"
                  }`}
                >
                  {notificationsEnabled ? "Activadas" : "Desactivadas"}
                </button>
              </div>
            )}
          </div>

          <div className="mx-4 border-t border-auria-border/70" />

          {/* Centro de ayuda */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("help")}
              aria-expanded={activeSection === "help"}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-auria-cream/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-auria-forest"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-auria-ink">
                  Centro de ayuda
                </p>
                <p className="mt-0.5 text-xs text-auria-muted">
                  Estamos para acompañarte
                </p>
              </div>
              <ChevronRightIcon />
            </button>

            {activeSection === "help" && (
              <div className="space-y-1 border-t border-auria-border/60 bg-auria-cream/40 px-4 py-3 text-xs text-auria-muted">
                <p className="font-semibold text-auria-ink">
                  Soporte AuriaWallet
                </p>
                <p>
                  Si tenés dudas sobre tus operaciones en ARS, USD o EUR,
                  escribinos a soporte@auriawallet.app.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Botón Cerrar sesión */}
      <div className="pt-1">
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-auria-border bg-auria-card px-4 text-sm font-bold text-auria-forest shadow-2xs transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}

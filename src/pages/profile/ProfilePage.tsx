import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const AUTH_STORAGE_KEY = "auria_wallet_auth";

type ProfileSectionKey =
  | "personal"
  | "security"
  | "limits"
  | "notifications"
  | "help"
  | null;

interface ProfileCardItem {
  key: Exclude<ProfileSectionKey, null>;
  title: string;
  description: string;
  anchorId?: string;
  renderIcon: () => ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase() || "AW";
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function UserCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11.5" r="2" />
      <path
        d="M6.5 16a3 3 0 0 1 5 0M14.5 10h3.5M14.5 14h3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldLockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11" strokeLinecap="round" />
    </svg>
  );
}

function SlidersCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 12h10M10 9.5v5M14 10.5v3" strokeLinecap="round" />
    </svg>
  );
}

function BellCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 0 1-6 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

const PROFILE_CARDS: ProfileCardItem[] = [
  {
    key: "personal",
    title: "Datos personales",
    description: "Nombre, correo y datos de tu cuenta.",
    renderIcon: () => <UserCardIcon />,
  },
  {
    key: "security",
    title: "Seguridad",
    description: "Métodos de acceso y estado de sesión.",
    renderIcon: () => <ShieldLockIcon />,
  },
  {
    key: "limits",
    title: "Límites de operación",
    description: "Monedas habilitadas y nivel de cuenta.",
    renderIcon: () => <SlidersCardIcon />,
  },
  {
    key: "notifications",
    title: "Notificaciones",
    description: "Alertas de movimientos y cotizaciones.",
    renderIcon: () => <BellCardIcon />,
  },
  {
    key: "help",
    title: "Centro de ayuda",
    description: "Soporte y consultas sobre tu billetera.",
    anchorId: "faq",
    renderIcon: () => <HelpCardIcon />,
  },
];

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { hash } = useLocation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<ProfileSectionKey>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const resolvedSection: ProfileSectionKey =
    activeSection === null && hash === "#faq" ? "help" : activeSection;

  const displayName = user?.name?.trim() || "Usuario Auria";
  const displayEmail = user?.email?.trim() || "cuenta@auriawallet.app";
  const initials = getInitials(displayName);

  useEffect(() => {
    if (hash !== "#faq") return;
    const faqElement = document.getElementById("faq");
    faqElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [hash]);

  const toggleSection = (section: Exclude<ProfileSectionKey, null>) => {
    setActiveSection((current) => {
      const effectiveCurrent =
        current === null && hash === "#faq" ? "help" : current;
      return effectiveCurrent === section ? null : section;
    });
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

  const renderSectionDetail = (section: Exclude<ProfileSectionKey, null>) => {
    if (section === "personal") {
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-auria-muted">Nombre completo</span>
            <span className="font-semibold text-auria-ink">{displayName}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-auria-muted">Email</span>
            <span className="font-semibold text-auria-ink">{displayEmail}</span>
          </div>
        </div>
      );
    }

    if (section === "security") {
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-auria-muted">Método de acceso</span>
            <span className="font-semibold text-auria-ink">
              Credenciales / Google
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-auria-muted">Estado de sesión</span>
            <span className="font-semibold text-auria-forest">Protegida</span>
          </div>
        </div>
      );
    }

    if (section === "limits") {
      return (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-auria-muted">Monedas habilitadas</span>
            <span className="font-semibold text-auria-ink">
              ARS · USD · EUR
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-auria-muted">Nivel de cuenta</span>
            <span className="font-semibold text-auria-forest">Verificada</span>
          </div>
        </div>
      );
    }

    if (section === "notifications") {
      return (
        <div className="flex items-center justify-between gap-3 text-xs">
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
      );
    }

    return (
      <div className="space-y-1 text-xs text-auria-muted">
        <p className="font-semibold text-auria-ink">Soporte AuriaWallet</p>
        <p>
          Si tenés dudas sobre tus operaciones en ARS, USD o EUR, escribinos a{" "}
          <span className="font-medium text-auria-ink">
            soporte@auriawallet.app
          </span>
          .
        </p>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-110 space-y-6 pb-2 lg:max-w-5xl">
      {/* Título superior */}
      <header className="lg:pt-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-auria-ink lg:text-[26px] lg:leading-tight">
          Perfil
        </h1>
      </header>

      {/* Cabecera de identidad */}
      <section
        aria-label="Datos del usuario"
        className="flex items-center gap-4 border-b border-auria-border pb-6"
      >
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-auria-border bg-auria-card text-lg font-bold tracking-wide text-auria-ink shadow-2xs"
        >
          {initials}
        </span>

        <div className="min-w-0">
          <p className="truncate text-lg font-bold tracking-wide text-auria-ink uppercase">
            {displayName}
          </p>
          <p className="truncate text-sm text-auria-muted">{displayEmail}</p>
        </div>
      </section>

      {/* Grilla de tarjetas de configuración */}
      <section
        aria-label="Opciones de perfil"
        className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PROFILE_CARDS.map((card) => {
          const isOpen = resolvedSection === card.key;

          return (
            <div
              key={card.key}
              id={card.anchorId}
              className={`rounded-2xl border bg-auria-card p-5 shadow-2xs transition ${
                isOpen
                  ? "border-auria-forest/45 ring-1 ring-auria-forest/15"
                  : "border-auria-border/80 hover:border-auria-forest/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSection(card.key)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer flex-col items-start text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auria-forest"
              >
                <span className="text-auria-ink">{card.renderIcon()}</span>
                <span className="mt-4 text-base font-bold text-auria-ink">
                  {card.title}
                </span>
                <span className="mt-1 text-xs leading-relaxed text-auria-muted">
                  {card.description}
                </span>
              </button>

              {isOpen && (
                <div className="mt-4 border-t border-auria-border/70 pt-3.5">
                  {renderSectionDetail(card.key)}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Cerrar sesión en mobile (< lg) */}
      <div className="pt-1 lg:hidden">
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

import { useState } from "react";
import { Link } from "react-router";

export function Navbar() {
  const [hasUnreadNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-auria-cream px-5 pt-4 pb-2">
      <Link
        to="/wallet"
        className="inline-flex items-center gap-3 text-auria-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
        aria-label="AuriaWallet Inicio"
      >
        <span className="inline-flex items-center gap-2" aria-hidden="true">
          <i className="block h-8 w-3 -skew-x-18 rounded-xs bg-auria-lime" />
          <i className="block h-8 w-3 -skew-x-18 rounded-xs bg-auria-lime" />
        </span>
        <span className="font-display text-[28px] leading-none tracking-tight">
          <strong className="font-bold">Auria</strong>
          <span className="font-normal">Wallet</span>
        </span>
      </Link>

      <button
        type="button"
        aria-label="Notificaciones"
        className="relative flex h-10 w-10 translate-y-0.5 cursor-pointer items-center justify-center rounded-full text-auria-ink transition hover:bg-auria-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 0 1-6 0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {hasUnreadNotifications && (
          <span
            aria-hidden="true"
            className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-auria-forest"
          />
        )}
      </button>
    </header>
  );
}
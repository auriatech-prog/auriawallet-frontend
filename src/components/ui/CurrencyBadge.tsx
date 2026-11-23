import React from 'react';
import { CURRENCY_CONFIG } from '../../config/currencies';
import type { CurrencyCode } from '../../types/wallet';

export interface CurrencyBadgeProps {
  /** Código de moneda (USD, EUR, ARS) */
  currency: CurrencyCode;
  /** Clase CSS adicional */
  className?: string;
}

export const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({ currency, className = '' }) => {
  const config = CURRENCY_CONFIG[currency];
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
  const color = 'bg-auria-lime-soft text-auria-ink'; // default style; can be tweaked per currency if needed
  return (
    <span className={`${base} ${color} ${className}`}> {config.symbol} {config.code} </span>
  );
};

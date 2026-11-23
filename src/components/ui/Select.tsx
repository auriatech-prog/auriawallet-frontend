import React from 'react';
import { SUPPORTED_CURRENCIES, CURRENCY_CONFIG } from '../../config/currencies';
import type { CurrencyCode } from '../../types/wallet';

export interface SelectProps {
  /** Valor seleccionado */
  value: string;
  /** Cambio de valor */
  onChange: (value: string) => void;
  /** Opciones personalizadas. Si no se proveen, se usan las monedas soportadas */
  options?: { value: string; label: string }[];
  /** Texto opcional de placeholder */
  placeholder?: string;
  /** Prop para desactivar */
  disabled?: boolean;
  /** Clase adicional */
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className = '',
}) => {
  const defaultOptions = SUPPORTED_CURRENCIES.map((code) => ({
    value: code,
    label: CURRENCY_CONFIG[code as CurrencyCode].label,
  }));
  const opts = options ?? defaultOptions;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-auria-forest disabled:opacity-50 ${className}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {opts.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
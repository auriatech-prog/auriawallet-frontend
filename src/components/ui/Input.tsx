import React, { useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Texto de la etiqueta */
  label?: string;
  /** Mensaje de error (se muestra en rojo) */
  error?: string;
  /** Texto de ayuda o descripción bajo el input */
  description?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  description,
  className = '',
  id,
  ...rest
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const descId = `${inputId}-desc`;

  const wrapperClasses = `flex flex-col gap-1 ${className}`;
  const inputBase = `rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-auria-forest disabled:opacity-50`;
  const inputClasses = error
    ? `${inputBase} border-red-500 focus:border-red-500 focus:ring-red-500`
    : `${inputBase} border-auria-border focus:border-auria-forest`;

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-auria-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        aria-describedby={error ? errorId : description ? descId : undefined}
        aria-invalid={!!error}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      ) : description ? (
        <p id={descId} className="text-xs text-auria-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
};

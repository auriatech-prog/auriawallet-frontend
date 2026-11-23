import React from 'react';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: Variant;
  /** Show loading spinner */
  isLoading?: boolean;
}

const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-auria-forest text-white hover:bg-auria-forest-hover',
  secondary: 'bg-auria-cream text-auria-ink border border-auria-border hover:bg-auria-muted',
  ghost: 'bg-transparent text-auria-ink hover:bg-auria-lime-soft',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...rest
}) => {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  return (
    <button
      type="button"
      className={classes}
      disabled={isLoading || disabled}
      {...rest}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 mr-2 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

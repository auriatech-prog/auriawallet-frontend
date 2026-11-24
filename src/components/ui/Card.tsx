import React from 'react';

export interface CardProps {
  /** Contenido interno del Card */
  children: React.ReactNode;
  /** Clase CSS adicional */
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const classes = `rounded-lg bg-auria-card shadow-md p-4 ${className}`;
  return <div className={classes}>{children}</div>;
};

import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  /** Controla la visibilidad del modal */
  isOpen: boolean;
  /** Callback para cerrar el modal */
  onClose: () => void;
  /** Contenido del modal */
  children: React.ReactNode;
  /** Título opcional */
  title?: string;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Hacer focus trap básico al abrir
  useEffect(() => {
    if (isOpen) {
      const previouslyFocused = document.activeElement as HTMLElement;
      overlayRef.current?.focus();
      return () => previouslyFocused?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-40" />
      {/* Modal panel */}
      <div
        ref={overlayRef}
        tabIndex={-1}
        className={`relative bg-auria-card rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 ${className}`}
      >
        {title && (
          <h2 id="modal-title" className="text-lg font-semibold mb-4 text-auria-ink">
            {title}
          </h2>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-auria-muted hover:text-auria-ink"
          aria-label="Close modal"
        >
          ✕
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

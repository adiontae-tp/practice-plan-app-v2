'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (
    message: string,
    options?: {
      variant?: ToastVariant;
      duration?: number;
      action?: Toast['action'];
    }
  ) => void;
  hideToast: (id: string) => void;
  success: (message: string, options?: { duration?: number; action?: Toast['action'] }) => void;
  error: (message: string, options?: { duration?: number; action?: Toast['action'] }) => void;
  warning: (message: string, options?: { duration?: number; action?: Toast['action'] }) => void;
  info: (message: string, options?: { duration?: number; action?: Toast['action'] }) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a MWToastProvider');
  }
  return context;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface MWToastProviderProps {
  children: React.ReactNode;
  /** Where toasts appear */
  position?: ToastPosition;
  /** Maximum number of visible toasts */
  maxVisible?: number;
  /** Default duration in ms */
  defaultDuration?: number;
}

export function MWToastProvider({
  children,
  position = 'top',
  maxVisible = 3,
  defaultDuration = 3000,
}: MWToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      options?: {
        variant?: ToastVariant;
        duration?: number;
        action?: Toast['action'];
      }
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: Toast = {
        id,
        message,
        variant: options?.variant ?? 'info',
        duration: options?.duration ?? defaultDuration,
        action: options?.action,
      };

      setToasts((prev) => {
        const next = [...prev, toast];
        // Limit visible toasts
        if (next.length > maxVisible) {
          return next.slice(-maxVisible);
        }
        return next;
      });

      // Auto dismiss
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, toast.duration);
      }
    },
    [defaultDuration, maxVisible, hideToast]
  );

  const success = useCallback(
    (message: string, options?: { duration?: number; action?: Toast['action'] }) => {
      showToast(message, { ...options, variant: 'success' });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: { duration?: number; action?: Toast['action'] }) => {
      showToast(message, { ...options, variant: 'error' });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: { duration?: number; action?: Toast['action'] }) => {
      showToast(message, { ...options, variant: 'warning' });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: { duration?: number; action?: Toast['action'] }) => {
      showToast(message, { ...options, variant: 'info' });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, hideToast, success, error, warning, info }}
    >
      {children}
      <MWToastContainer toasts={toasts} position={position} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Toast Container
// ---------------------------------------------------------------------------

interface MWToastContainerProps {
  toasts: Toast[];
  position: ToastPosition;
  onDismiss: (id: string) => void;
}

function MWToastContainer({ toasts, position, onDismiss }: MWToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-[200] flex flex-col gap-2 px-4 pointer-events-none',
        position === 'top'
          ? 'top-0 pt-[calc(env(safe-area-inset-top)+1rem)]'
          : 'bottom-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]'
      )}
    >
      {toasts.map((toast) => (
        <MWToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast Item
// ---------------------------------------------------------------------------

interface MWToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function MWToastItem({ toast, onDismiss }: MWToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const variantStyles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-orange-500',
    info: 'bg-gray-800',
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[toast.variant];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg',
        'pointer-events-auto',
        'transition-all duration-300 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4',
        variantStyles[toast.variant]
      )}
    >
      <Icon className="w-5 h-5 text-white flex-shrink-0" />
      <p className="flex-1 text-sm text-white font-medium">{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          onClick={toast.action.onPress}
          className="text-sm font-semibold text-white/90 hover:text-white"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 -mr-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

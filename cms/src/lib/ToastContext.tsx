import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  showSuccessDialog: (message: string, onConfirm?: () => void) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const dialogOnConfirmRef = useRef<(() => void) | undefined>(undefined);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const showSuccessDialog = useCallback((message: string, onConfirm?: () => void) => {
    dialogOnConfirmRef.current = onConfirm;
    setDialogMessage(message);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogMessage(null);
    const onConfirm = dialogOnConfirmRef.current;
    dialogOnConfirmRef.current = undefined;
    onConfirm?.();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccessDialog }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
      {dialogMessage && (
        <div className="dialog-overlay" onClick={closeDialog} role="presentation">
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-icon" aria-hidden="true">
              ✓
            </div>
            <p id="success-dialog-title" className="dialog-title">
              {dialogMessage}
            </p>
            <button type="button" className="btn-primary" onClick={closeDialog}>
              确定
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import Toast from "../components/common/Toast";
import ConfirmDialog from "../components/common/ConfirmDialog";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDanger: false,
    resolve: null,
  });

  // Track recent toast to prevent double-firing in StrictMode or rapid clicks
  const recentToastRef = useRef({ key: "", time: 0 });

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", message = "", title = "", duration = 4500 }) => {
      if (!message) return;

      const dedupeKey = `${type}:${message}`;
      const now = Date.now();
      if (
        recentToastRef.current.key === dedupeKey &&
        now - recentToastRef.current.time < 750
      ) {
        return; // Suppress duplicate toast burst
      }
      recentToastRef.current = { key: dedupeKey, time: now };

      const id = `${now}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const showSuccess = useCallback(
    (message, title = "", duration = 4500) => {
      return showToast({ type: "success", message, title, duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (message, title = "", duration = 5000) => {
      return showToast({ type: "error", message, title, duration });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message, title = "", duration = 4500) => {
      return showToast({ type: "warning", message, title, duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message, title = "", duration = 4500) => {
      return showToast({ type: "info", message, title, duration });
    },
    [showToast]
  );

  const confirm = useCallback(
    ({
      title = "Confirm Action",
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      isDanger = false,
    } = {}) => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          isDanger,
          resolve,
        });
      });
    },
    []
  );

  const handleDialogConfirm = () => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleDialogCancel = () => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const toast = {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        toast,
        confirm,
        removeToast,
      }}
    >
      {children}

      {/* Floating responsive toast container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] pointer-events-none flex flex-col space-y-2.5 max-w-sm sm:max-w-md w-full px-2 sm:px-0"
      >
        {toasts.map((item) => (
          <Toast
            key={item.id}
            id={item.id}
            type={item.type}
            title={item.title}
            message={item.message}
            duration={item.duration}
            onClose={removeToast}
          />
        ))}
      </div>

      {/* Modal Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        isDanger={dialogState.isDanger}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Safe fallback so isolated tests don't crash if rendered without ToastProvider
    return {
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      toast: {
        success: (msg) => console.log("[HomeHub Success Toast]", msg),
        error: (msg) => console.error("[HomeHub Error Toast]", msg),
        warning: (msg) => console.warn("[HomeHub Warning Toast]", msg),
        info: (msg) => console.info("[HomeHub Info Toast]", msg),
      },
      confirm: async () => true,
      removeToast: () => {},
    };
  }
  return context;
};

export default ToastContext;

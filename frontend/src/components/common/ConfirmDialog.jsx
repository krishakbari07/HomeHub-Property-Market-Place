import React, { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen = false,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus initial button
    if (confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Tab") {
        const focusable = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-navy-950/65 backdrop-blur-xs transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="bg-[#FDFCFB] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-ivory-300 relative text-left animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 text-navy-400 hover:text-navy-700 p-1 rounded-lg hover:bg-ivory-200 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
              isDanger
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-gold-50 text-gold-700 border-gold-300"
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1.5 flex-1 pr-4">
            <h3
              id="confirm-dialog-title"
              className="font-heading font-bold text-base text-navy-900 leading-snug"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="text-xs sm:text-sm text-navy-600 leading-relaxed font-sans"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-ivory-300/80">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-navy-700 bg-white hover:bg-ivory-200 border border-ivory-300 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700 active:scale-98"
                : "bg-forest-700 hover:bg-forest-800 active:scale-98"
            }`}
          >
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

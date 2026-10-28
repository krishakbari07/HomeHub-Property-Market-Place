import React, { useEffect, useState, useRef, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const TOAST_STYLES = {
  success: {
    bg: "bg-[#FFFFFF] border-forest-200",
    badge: "bg-forest-50 text-forest-700 border-forest-200",
    icon: CheckCircle2,
    progressBar: "bg-forest-600",
    defaultTitle: "Success",
  },
  error: {
    bg: "bg-[#FFFFFF] border-rose-200",
    badge: "bg-rose-50 text-rose-600 border-rose-200",
    icon: AlertCircle,
    progressBar: "bg-rose-600",
    defaultTitle: "Action Failed",
  },
  warning: {
    bg: "bg-[#FFFFFF] border-gold-300",
    badge: "bg-gold-50 text-gold-700 border-gold-300",
    icon: AlertTriangle,
    progressBar: "bg-gold-500",
    defaultTitle: "Notice",
  },
  info: {
    bg: "bg-[#FFFFFF] border-navy-200",
    badge: "bg-navy-50 text-navy-800 border-navy-200",
    icon: Info,
    progressBar: "bg-navy-800",
    defaultTitle: "Information",
  },
};

export default function Toast({
  id,
  type = "info",
  title,
  message,
  duration = 4500,
  onClose,
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isClosing, setIsClosing] = useState(false);
  const lastTickRef = useRef(Date.now());

  const styleConfig = TOAST_STYLES[type] || TOAST_STYLES.info;
  const IconComponent = styleConfig.icon;
  const resolvedTitle = title || styleConfig.defaultTitle;

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 200);
  }, [id, onClose]);

  useEffect(() => {
    if (duration <= 0) return;

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      if (!isPaused) {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;

        setRemainingTime((prev) => {
          if (prev <= delta) {
            clearInterval(interval);
            handleClose();
            return 0;
          }
          return prev - delta;
        });
      } else {
        lastTickRef.current = Date.now();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, duration, handleClose]);

  const progressPercent = duration > 0 ? (remainingTime / duration) * 100 : 0;
  const isAlert = type === "error" || type === "warning";

  return (
    <div
      role={isAlert ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border p-4 shadow-elevated backdrop-blur-md transition-all duration-200 pointer-events-auto ${
        styleConfig.bg
      } ${
        isClosing
          ? "opacity-0 translate-y-2 scale-95"
          : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${styleConfig.badge}`}
        >
          <IconComponent className="w-5 h-5 shrink-0" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          {resolvedTitle && (
            <h4 className="font-heading font-bold text-sm text-navy-900 leading-snug tracking-tight">
              {resolvedTitle}
            </h4>
          )}
          <p className="text-xs sm:text-sm text-navy-700 font-sans leading-relaxed mt-0.5 break-words">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close notification"
          className="text-navy-400 hover:text-navy-800 p-1 rounded-lg hover:bg-ivory-200 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-ivory-200/60 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${styleConfig.progressBar}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

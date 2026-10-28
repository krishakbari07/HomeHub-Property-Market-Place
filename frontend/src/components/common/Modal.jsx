import React from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-elevated relative border border-ivory-300">
        <div className="flex items-center justify-between border-b border-ivory-200 pb-3 mb-4">
          <h3 className="text-xl font-heading font-extrabold text-navy-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-navy-400 hover:text-navy-700 rounded-lg hover:bg-ivory-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

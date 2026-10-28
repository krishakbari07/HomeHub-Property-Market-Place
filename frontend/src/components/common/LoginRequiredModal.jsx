import React from "react";
import { Link } from "react-router-dom";
import { Lock, X, LogIn, UserPlus } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";

const LoginRequiredModal = () => {
  const { authModalOpen, setAuthModalOpen, authModalMessage } = useProperty();

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-elevated relative border border-ivory-300 text-center space-y-6">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-navy-400 hover:text-navy-700 rounded-full hover:bg-ivory-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto bg-forest-50 text-forest-700 border border-forest-100 rounded-2xl flex items-center justify-center shadow-subtle">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-heading font-extrabold text-navy-900">
            Account Required
          </h3>
          <p className="text-navy-600 text-sm leading-relaxed font-sans">
            {authModalMessage || "You can browse and watch all properties freely! However, to book an appointment, schedule a visit, or contact the owner/agent, please log in or create an account."}
          </p>
          <div className="p-3 bg-ivory-100 border border-ivory-300 rounded-xl text-xs text-forest-800 font-semibold mt-2">
            Browsing and viewing verified listings is completely public and open for everyone.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <Link
            to="/login"
            onClick={() => setAuthModalOpen(false)}
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-subtle border border-forest-800 text-sm active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            onClick={() => setAuthModalOpen(false)}
            className="w-full bg-ivory-100 hover:bg-ivory-200 text-navy-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all border border-ivory-300 text-sm active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-forest-700" />
            <span>Register</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;

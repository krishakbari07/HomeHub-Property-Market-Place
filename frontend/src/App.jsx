import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { PropertyProvider } from "./context/PropertyContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <PropertyProvider>
            <div className="min-h-screen font-sans text-gray-800 antialiased selection:bg-indigo-500 selection:text-white">
              <AppRoutes />
            </div>
          </PropertyProvider>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

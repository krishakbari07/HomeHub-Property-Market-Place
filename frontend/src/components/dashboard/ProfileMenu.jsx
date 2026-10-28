import React, { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center space-x-2">
        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
          {user?.name?.[0] || "U"}
        </div>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl p-2 z-50 space-y-1">
          <div className="px-3 py-2 border-b">
            <p className="font-bold text-sm text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

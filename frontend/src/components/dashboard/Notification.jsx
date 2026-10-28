import React from "react";
import { Bell } from "lucide-react";

const Notification = ({ title, message, time }) => {
  return (
    <div className="p-4 bg-white border border-gray-100 rounded-xl flex items-start space-x-3">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
        <Bell className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">{message}</p>
        <span className="text-[10px] text-gray-400 mt-1 block">{time}</span>
      </div>
    </div>
  );
};

export default Notification;

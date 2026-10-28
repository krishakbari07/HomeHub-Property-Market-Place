import React from "react";
import { Link } from "react-router-dom";

const DashboardCard = ({ title, value, change, icon: Icon, color = "forest", onClick, link }) => {
  const cardContent = (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-ivory-300 shadow-subtle flex items-center justify-between transition-all duration-200 ${
        onClick || link ? "hover:shadow-card cursor-pointer hover:border-navy-300 hover:-translate-y-0.5" : ""
      }`}
    >
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-navy-400">{title}</p>
        <p className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900">{value}</p>
        {change && <span className="text-xs text-forest-700 font-semibold">{change}</span>}
      </div>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-ivory-100 text-forest-700 border border-ivory-300 flex items-center justify-center font-bold shadow-subtle">
          <Icon className="w-5 h-5 text-forest-700" />
        </div>
      )}
    </div>
  );

  if (link) {
    return <Link to={link}>{cardContent}</Link>;
  }

  return cardContent;
};

export default DashboardCard;

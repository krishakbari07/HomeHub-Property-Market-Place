import React from "react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

const EmptyState = ({
  title = "No Properties Found",
  description = "Try changing your filters or search location.",
  actionText = "Explore All Properties",
  actionLink = "/buy",
  onAction,
  icon: Icon = SearchX,
}) => {
  return (
    <div className="bg-white rounded-3xl p-10 sm:p-12 border border-ivory-300 shadow-card text-center max-w-lg mx-auto space-y-4 my-8">
      <div className="w-16 h-16 mx-auto bg-forest-50 text-forest-700 border border-forest-100 rounded-2xl flex items-center justify-center shadow-subtle">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-heading font-bold text-navy-900">{title}</h3>
      <p className="text-navy-600 text-sm leading-relaxed max-w-md mx-auto">{description}</p>
      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-semibold transition-colors shadow-subtle border border-forest-800 text-sm active:scale-98"
        >
          {actionText}
        </button>
      ) : actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-semibold transition-colors shadow-subtle border border-forest-800 text-sm active:scale-98"
        >
          {actionText}
        </Link>
      ) : null}
    </div>
  );
};

export default EmptyState;

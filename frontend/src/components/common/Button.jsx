import React from "react";

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const baseStyles = "px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-forest-700/30 shadow-subtle flex items-center justify-center space-x-2 text-sm";
  const variants = {
    primary: "bg-forest-700 hover:bg-forest-800 text-white border border-forest-800",
    secondary: "bg-ivory-100 hover:bg-ivory-200 text-navy-900 border border-ivory-300",
    outline: "border border-ivory-300 hover:border-forest-700 text-navy-800 hover:text-forest-700 bg-white",
    danger: "bg-rose-600 hover:bg-rose-700 text-white"
  };

  return (
    <button className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;

import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ label = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
      <p className="text-sm font-semibold text-navy-600">{label}</p>
    </div>
  );
};

export default Loader;

import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import useFormValidation from "../../../hooks/useFormValidation";

const AGENT_PROFILE_SCHEMA = {
  name: {
    label: "Agent Full Name",
    required: true,
    minLength: 2,
  },
  reraId: {
    label: "RERA Registration Number",
    minLength: 3,
  },
};

const AgentProfile = () => {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);

  const {
    values,
    setValues,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(
    {
      name: user?.name || "",
      agencyName: user?.agencyName || "",
      reraId: user?.reraId || "",
      region: user?.region || "",
    },
    AGENT_PROFILE_SCHEMA
  );

  useEffect(() => {
    if (user) {
      setValues({
        name: user.name || "",
        agencyName: user.agencyName || "",
        reraId: user.reraId || "",
        region: user.region || "",
      });
    }
  }, [user, setValues]);

  const onSubmit = async (formValues) => {
    await updateProfile({
      name: formValues.name,
      agencyName: formValues.agencyName,
      reraId: formValues.reraId,
      region: formValues.region,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Agent Profile & RERA Details</h1>
          <p className="text-gray-500 text-sm mt-1">Manage agent credentials, agency details, and RERA registration.</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>RERA Agent profile updated and saved!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4" noValidate>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Agent Full Name</label>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-3 rounded-xl text-sm font-semibold transition-colors ${
              touched.name && errors.name ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50/20" : "border-gray-200"
            }`}
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Agency Name</label>
          <input
            type="text"
            name="agencyName"
            value={values.agencyName}
            onChange={handleChange}
            className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Gujarat RERA Registration Number</label>
          <input
            type="text"
            name="reraId"
            value={values.reraId}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. PR/GJ/AHMEDABAD/..."
            className={`w-full border p-3 rounded-xl text-sm font-semibold transition-colors ${
              touched.reraId && errors.reraId ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50/20" : "border-gray-200"
            }`}
          />
          {touched.reraId && errors.reraId && (
            <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.reraId}</span>
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Operating Region</label>
          <input
            type="text"
            name="region"
            value={values.region}
            onChange={handleChange}
            className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all">
          {isSubmitting ? "Saving..." : "Save Agent Details"}
        </button>
      </form>
    </div>
  );
};

export default AgentProfile;

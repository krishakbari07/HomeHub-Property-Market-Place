import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, User, Mail, Phone, Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useFormValidation from "../../hooks/useFormValidation";

const REGISTER_VALIDATION_SCHEMA = {
  name: {
    label: "Full Name",
    required: true,
    minLength: 2,
  },
  email: {
    label: "Email Address",
    required: true,
    email: true,
  },
  phone: {
    label: "Phone Number",
    required: true,
    phone: true,
  },
  password: {
    label: "Password",
    required: true,
    minLength: 6,
  },
  confirmPassword: {
    label: "Confirm Password",
    required: true,
    matchField: "password",
    matchFieldName: "Passwords",
  },
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    values,
    setFieldValue,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(
    {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "Buyer",
    },
    REGISTER_VALIDATION_SCHEMA
  );

  // Handle Form Submission -> Direct User Registration in MongoDB Atlas
  const onRegisterSubmit = async (formValues) => {
    setServerError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await register({
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        password: formValues.password,
        role: formValues.role,
      });

      setSuccess("Account created successfully! Redirecting to sign in...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Failed to create account. Please check your details.";
      setServerError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-ivory-100 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-card border border-ivory-300 max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-navy-800 text-white rounded-2xl flex items-center justify-center shadow-subtle border border-navy-700">
            <Building2 className="w-6 h-6 text-gold-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900 tracking-tight">
            Create HomeHub Account
          </h1>
          <p className="text-navy-500 text-xs sm:text-sm font-sans">
            Join the verified real estate marketplace
          </p>
        </div>

        {/* Error / Success Banners */}
        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-forest-50 border border-forest-200 text-forest-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4" noValidate>
          {/* Account Role Selection */}
          <div>
            <label className="text-xs font-bold text-navy-700 uppercase tracking-wider block mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Buyer", value: "Buyer" },
                { label: "Tenant", value: "Rental" },
                { label: "Seller", value: "Seller" },
                { label: "Agent", value: "Agent" },
              ].map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setFieldValue("role", r.value)}
                  className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                    values.role === r.value
                      ? "bg-navy-800 text-white border-navy-800 shadow-subtle"
                      : "bg-ivory-50 text-navy-700 border-ivory-300 hover:bg-ivory-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-navy-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={(e) => {
                  setServerError("");
                  handleChange(e);
                }}
                onBlur={handleBlur}
                placeholder="Rohan Sharma"
                className={`w-full bg-ivory-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors ${
                  touched.name && errors.name
                    ? "border-rose-400 ring-1 ring-rose-300"
                    : "border-ivory-300 focus:border-forest-600 focus:bg-white"
                }`}
              />
            </div>
            {touched.name && errors.name && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-navy-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={(e) => {
                  setServerError("");
                  handleChange(e);
                }}
                onBlur={handleBlur}
                placeholder="rohan@example.com"
                className={`w-full bg-ivory-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors ${
                  touched.email && errors.email
                    ? "border-rose-400 ring-1 ring-rose-300"
                    : "border-ivory-300 focus:border-forest-600 focus:bg-white"
                }`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-navy-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={(e) => {
                  setServerError("");
                  handleChange(e);
                }}
                onBlur={handleBlur}
                placeholder="+91 98765 43210"
                className={`w-full bg-ivory-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors ${
                  touched.phone && errors.phone
                    ? "border-rose-400 ring-1 ring-rose-300"
                    : "border-ivory-300 focus:border-forest-600 focus:bg-white"
                }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={(e) => {
                    setServerError("");
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`w-full bg-ivory-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors ${
                    touched.password && errors.password
                      ? "border-rose-400 ring-1 ring-rose-300"
                      : "border-ivory-300 focus:border-forest-600 focus:bg-white"
                  }`}
                />
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-navy-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={(e) => {
                    setServerError("");
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`w-full bg-ivory-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-rose-400 ring-1 ring-rose-300"
                      : "border-ivory-300 focus:border-forest-600 focus:bg-white"
                  }`}
                />
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-forest-700 hover:bg-forest-800 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all shadow-subtle border border-forest-800 text-sm mt-2 active:scale-98 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-navy-500 pt-3 border-t border-ivory-200">
          Already registered on HomeHub?{" "}
          <Link to="/login" className="font-bold text-forest-700 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

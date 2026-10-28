import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useFormValidation from "../../hooks/useFormValidation";

const LOGIN_VALIDATION_SCHEMA = {
  email: {
    label: "Email Address",
    required: true,
    email: true,
  },
  password: {
    label: "Password",
    required: true,
    minLength: 6,
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(
    { email: "", password: "" },
    LOGIN_VALIDATION_SCHEMA
  );

  const handleLoginSuccess = (userObj) => {
    switch (userObj?.role?.toLowerCase()) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "agent":
        navigate("/agent/dashboard");
        break;
      case "buyer":
      case "renter":
      case "rental":
      default:
        navigate("/buyer/dashboard");
        break;
    }
  };

  const onSubmit = async (formValues) => {
    setServerError("");
    try {
      const loggedUser = await login(formValues.email, formValues.password);
      handleLoginSuccess(loggedUser);
    } catch (err) {
      setServerError(err.message || "Invalid email or password.");
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
            Client & Admin Portal
          </h1>
          <p className="text-navy-500 text-xs sm:text-sm font-sans">
            Sign in to access your designated HomeHub dashboard
          </p>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                placeholder="name@example.com"
                className={`w-full bg-ivory-50 border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-navy-900 transition-colors ${
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-navy-700 block uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-forest-700 hover:text-forest-800">
                Forgot password?
              </Link>
            </div>
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
                className={`w-full bg-ivory-50 border rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-navy-900 transition-colors ${
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-forest-700 hover:bg-forest-800 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all shadow-subtle border border-forest-800 text-sm mt-2 flex items-center justify-center space-x-2 active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? "Authenticating..." : "Sign In to Account"}</span>
          </button>
        </form>

        <div className="text-center text-xs text-navy-500 pt-3 border-t border-ivory-200">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-bold text-forest-700 hover:underline">
            Register as Client or Agent
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

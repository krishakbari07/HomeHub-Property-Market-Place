import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import useFormValidation from "../../hooks/useFormValidation";
import { authApi } from "../../services/api";

const RESET_PASSWORD_SCHEMA = {
  email: {
    label: "Registered Email Address",
    required: true,
    email: true,
  },
  phone: {
    label: "Registered Phone Number",
    required: true,
    phone: true,
  },
  password: {
    label: "New Password",
    required: true,
    minLength: 6,
  },
  confirmPassword: {
    label: "Confirm New Password",
    required: true,
    matchField: "password",
    matchFieldName: "Passwords",
  },
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(
    {
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    RESET_PASSWORD_SCHEMA
  );

  const onSubmit = async (formValues) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        email: formValues.email,
        phone: formValues.phone,
        newPassword: formValues.password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || "Failed to update password. Please check your verification details.";
      setServerError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-ivory-100 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-card border border-ivory-300 max-w-md w-full space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-navy-600 hover:text-forest-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-forest-50 text-forest-700 border border-forest-100 rounded-2xl flex items-center justify-center font-bold shadow-subtle">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-navy-900 tracking-tight">
            Reset Account Password
          </h1>
          <p className="text-navy-600 text-xs sm:text-sm font-sans">
            Verify your registered email and phone number to set a new password.
          </p>
        </div>

        {serverError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-forest-50 border border-forest-200 rounded-2xl text-forest-900 space-y-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-forest-700 mx-auto" />
            <h3 className="font-heading font-bold text-base text-navy-900">Password Updated Successfully</h3>
            <p className="text-xs text-navy-600 leading-relaxed font-sans">
              Your password has been securely updated. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
                Registered Email Address
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
                Registered Phone Number
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

            {/* New Password */}
            <div>
              <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
                New Password
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

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
                Confirm New Password
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-forest-700 hover:bg-forest-800 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all shadow-subtle border border-forest-800 text-sm mt-2 active:scale-98 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-navy-500 pt-3 border-t border-ivory-200">
          Remember your password?{" "}
          <Link to="/login" className="font-bold text-forest-700 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

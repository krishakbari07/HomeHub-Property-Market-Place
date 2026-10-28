import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import useFormValidation from "../../hooks/useFormValidation";

const CONTACT_VALIDATION_SCHEMA = {
  name: {
    label: "Your Name",
    required: true,
    minLength: 2,
  },
  email: {
    label: "Email Address",
    required: true,
    email: true,
  },
  message: {
    label: "Message",
    required: true,
    minLength: 10,
  },
};

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useFormValidation(
    { name: "", email: "", message: "" },
    CONTACT_VALIDATION_SCHEMA
  );

  const onSubmit = async () => {
    setSubmitted(true);
    resetForm();
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="py-16 bg-ivory-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700 block">
            Client Concierge
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy-900 tracking-tight">
            Connect with HomeHub Advisory
          </h1>
          <p className="text-navy-500 text-xs sm:text-sm font-sans">
            Inquire about verified portfolio properties, partnership opportunities, or technical assistance.
          </p>
        </div>

        {submitted && (
          <div className="p-4 bg-forest-50 border border-forest-200 text-forest-800 rounded-2xl flex items-center space-x-3 font-semibold text-sm shadow-subtle">
            <CheckCircle2 className="w-5 h-5 text-forest-700 shrink-0" />
            <span>Thank you for reaching out. A dedicated property advisor will contact you within 24 business hours.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6 bg-white p-8 rounded-3xl border border-ivory-300 shadow-subtle">
            <div className="space-y-6">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-ivory-100 text-forest-700 border border-ivory-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-forest-700" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-navy-900 text-sm">Headquarters</h4>
                  <p className="text-xs text-navy-600 font-sans mt-0.5 leading-relaxed">Bodakdev, SG Highway, Ahmedabad, Gujarat 380054</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-ivory-100 text-forest-700 border border-ivory-300 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-forest-700" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-navy-900 text-sm">Direct Phone</h4>
                  <p className="text-xs text-navy-600 font-sans mt-0.5">+91 1800 123 4567 (Client Advisory)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-ivory-100 text-forest-700 border border-ivory-300 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-forest-700" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-navy-900 text-sm">Official Email</h4>
                  <p className="text-xs text-navy-600 font-sans mt-0.5">concierge@homehub.com</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 bg-white p-8 rounded-3xl border border-ivory-300 shadow-subtle space-y-4" noValidate>
            <div>
              <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Anand Mehta"
                className={`w-full bg-ivory-50 border p-3 rounded-xl text-sm font-semibold text-navy-900 transition-colors ${
                  touched.name && errors.name
                    ? "border-rose-400 ring-1 ring-rose-300"
                    : "border-ivory-300 focus:border-forest-600 focus:bg-white"
                }`}
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="anand@example.com"
                className={`w-full bg-ivory-50 border p-3 rounded-xl text-sm font-semibold text-navy-900 transition-colors ${
                  touched.email && errors.email
                    ? "border-rose-400 ring-1 ring-rose-300"
                    : "border-ivory-300 focus:border-forest-600 focus:bg-white"
                }`}
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">
                Inquiry Details *
              </label>
              <textarea
                name="message"
                value={values.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tell us about the property, budget parameters, or advisory needs..."
                className={`w-full bg-ivory-50 border p-3 rounded-xl text-sm font-medium text-navy-900 h-32 transition-colors ${
                  touched.message && errors.message
                    ? "border-rose-400 ring-1 ring-rose-300"
                    : "border-ivory-300 focus:border-forest-600 focus:bg-white"
                }`}
              />
              {touched.message && errors.message && (
                <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-forest-700 hover:bg-forest-800 disabled:opacity-60 text-white font-semibold py-3.5 px-8 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-subtle border border-forest-800 active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Dispatching..." : "Send Message to Concierge"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

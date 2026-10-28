import React, { useState, useEffect } from "react";
import { User, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import useFormValidation from "../../../hooks/useFormValidation";

const BUYER_PROFILE_SCHEMA = {
  name: {
    label: "Full Name",
    required: true,
    minLength: 2,
  },
  phone: {
    label: "Phone Number",
    phone: true,
  },
};

const BuyerProfile = () => {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);

  const rawRole = (user?.role || "buyer").toLowerCase();
  const isRenter = rawRole === "renter" || rawRole === "rental";

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
      phone: user?.phone || "",
      preferredCity: user?.preferredCity || "Ahmedabad",
      rentalBudget: user?.rentalBudget || "",
      buyerBudget: user?.buyerBudget || "",
      budgetRange: user?.budgetRange || "",
    },
    BUYER_PROFILE_SCHEMA
  );

  useEffect(() => {
    if (user) {
      setValues({
        name: user.name || "",
        phone: user.phone || "",
        preferredCity: user.preferredCity || "Ahmedabad",
        rentalBudget: user.rentalBudget || "",
        buyerBudget: user.buyerBudget || "",
        budgetRange: user.budgetRange || "",
      });
    }
  }, [user, setValues]);

  const onSubmit = async (formValues) => {
    const payload = {
      name: formValues.name,
      phone: formValues.phone,
      preferredCity: formValues.preferredCity,
    };

    if (isRenter) {
      if (formValues.rentalBudget !== "") {
        payload.rentalBudget = Number(formValues.rentalBudget) || null;
        payload.budgetRange = formValues.rentalBudget ? `₹ ${Number(formValues.rentalBudget).toLocaleString("en-IN")}/month` : "";
      }
    } else {
      if (formValues.buyerBudget !== "") {
        payload.buyerBudget = Number(formValues.buyerBudget) || null;
      }
      if (formValues.budgetRange !== undefined) {
        payload.budgetRange = formValues.budgetRange;
      }
    }

    await updateProfile(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {isRenter ? "Renter Profile Settings" : "Buyer Profile Settings"}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Manage your account details and {isRenter ? "rental preferences" : "acquisition preferences"}.
          </p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold shrink-0">
          <User className="w-6 h-6" />
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4" noValidate>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
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
          <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
          <input type="email" value={user?.email || ""} className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold bg-gray-50 cursor-not-allowed text-gray-500" disabled />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-3 rounded-xl text-sm font-semibold transition-colors ${
              touched.phone && errors.phone ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50/20" : "border-gray-200"
            }`}
          />
          {touched.phone && errors.phone && (
            <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.phone}</span>
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Preferred City</label>
          <select
            name="preferredCity"
            value={values.preferredCity}
            onChange={handleChange}
            className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold bg-white"
          >
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Surat">Surat</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Gandhinagar">Gandhinagar</option>
          </select>
        </div>

        {/* Dynamic Budget Preference according to Role */}
        {isRenter ? (
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Monthly Rental Budget (₹ per month)
            </label>
            <input
              type="number"
              name="rentalBudget"
              value={values.rentalBudget}
              onChange={handleChange}
              placeholder="e.g. 25000"
              className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Enter your monthly rental target. Will display as ₹25,000/month.
            </p>
          </div>
        ) : (
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Purchase Investment Budget (₹)
            </label>
            <input
              type="text"
              name="budgetRange"
              value={values.budgetRange}
              onChange={handleChange}
              placeholder="e.g. ₹ 1 Cr - ₹ 2 Cr or 15000000"
              className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Specify your target acquisition price range for purchase listings.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all disabled:opacity-60 min-h-[44px]"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default BuyerProfile;

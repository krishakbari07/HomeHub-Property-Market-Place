import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home as HomeIcon, Lock, Mail, User, Phone, ShoppingBag, Home, Briefcase, Award, MapPin, Building, CheckCircle2 } from "lucide-react";

const Register = () => {
  const [selectedRole, setSelectedRole] = useState("Buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  
  // Buyer-specific
  const [preferredCity, setPreferredCity] = useState("Ahmedabad");
  
  // Seller-specific
  const [propertyType, setPropertyType] = useState("Apartment");
  
  // Agent-specific
  const [agencyName, setAgencyName] = useState("");
  const [reraId, setReraId] = useState("");
  const [operatingRegion, setOperatingRegion] = useState("Ahmedabad & Gandhinagar");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    register({
      name,
      email,
      phone,
      role: selectedRole,
      preferredCity,
      propertyType,
      agencyName,
      reraId,
      region: operatingRegion
    });

    setRegisteredSuccess(true);

    // Redirect to Login page after brief delay
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <HomeIcon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Home<span className="text-indigo-600">Hub</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-gray-500 font-medium">Register as a Buyer, Seller, or Certified Agent</p>
        </div>

        {registeredSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold text-center flex items-center justify-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Registration successful! Redirecting to Login page...</span>
          </div>
        )}

        {/* Role Toggle */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider text-center">I am a</label>
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-2xl text-center">
            {[
              { role: "Buyer", icon: ShoppingBag },
              { role: "Seller", icon: Home },
              { role: "Agent", icon: Briefcase }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = selectedRole === tab.role;
              return (
                <button
                  key={tab.role}
                  type="button"
                  onClick={() => setSelectedRole(tab.role)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1 ${
                    isSel ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form per Role */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98980 00000"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Buyer Specific Fields */}
          {selectedRole === "Buyer" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Preferred City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={preferredCity}
                  onChange={(e) => setPreferredCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Surat">Surat</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Gandhinagar">Gandhinagar</option>
                  <option value="Rajkot">Rajkot</option>
                </select>
              </div>
            </div>
          )}

          {/* Seller Specific Fields */}
          {selectedRole === "Seller" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Property Type to Sell</label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Apartment">Apartment / Flat</option>
                  <option value="Villa">Villa / House</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Plot">Land / Plot</option>
                </select>
              </div>
            </div>
          )}

          {/* Agent Specific Fields */}
          {selectedRole === "Agent" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Agency / Company Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g. Apex Realty Experts"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">RERA License ID</label>
                <div className="relative">
                  <Award className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={reraId}
                    onChange={(e) => setReraId(e.target.value)}
                    placeholder="GUJ/RERA/AHM/2024/XXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Operating Region</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={operatingRegion}
                    onChange={(e) => setOperatingRegion(e.target.value)}
                    placeholder="e.g. Ahmedabad & Gandhinagar"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-indigo-200 transition"
          >
            Register as {selectedRole} & Go to Login
          </button>
        </form>

        {/* Switch */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Globe, Share2, MessageCircle, Send, Mail, ShieldCheck } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-navy-900 text-ivory-100 pt-16 pb-10 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-800/80">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center text-white shadow-subtle">
                <Building2 className="w-5 h-5 text-gold-400" />
              </div>
              <span className="text-2xl font-heading font-extrabold text-white tracking-tight">
                Home<span className="text-forest-400">Hub</span>
              </span>
            </Link>

            <p className="text-sm text-navy-300 max-w-sm leading-relaxed font-sans">
              Curated luxury and prime residential real estate across India. AI-assisted property discovery, verified market listings, and direct appointments with licensed advisors.
            </p>

            <div className="flex space-x-2.5 pt-2">
              {[
                { icon: Globe, label: "Website" },
                { icon: Share2, label: "Share" },
                { icon: MessageCircle, label: "Inquiries" },
                { icon: Mail, label: "Email" },
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={index}
                    href="#root"
                    aria-label={item.label}
                    className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-forest-700 border border-navy-700/60 text-navy-300 hover:text-white flex items-center justify-center transition-all duration-200"
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Real Estate Offerings */}
          <div>
            <h3 className="text-xs font-heading font-bold text-gold-400 uppercase tracking-wider mb-4">
              Properties
            </h3>
            <ul className="space-y-2.5 text-sm font-sans text-navy-300">
              <li>
                <Link to="/buy" className="hover:text-white transition-colors">Properties for Sale</Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-white transition-colors">Rental Residences</Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-white transition-colors">List Your Property</Link>
              </li>
              <li>
                <Link to="/ai-recommendations" className="hover:text-white transition-colors">AI Property Match</Link>
              </li>
              <li>
                <Link to="/agents" className="hover:text-white transition-colors">Licensed Brokers</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-heading font-bold text-gold-400 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm font-sans text-navy-300">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About HomeHub</Link>
              </li>
              <li>
                <Link to="/agents" className="hover:text-white transition-colors">Advisory Network</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Client Support</Link>
              </li>
              <li>
                <Link to="/buy" className="hover:text-white transition-colors">Market Insights</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Trust & Verification</Link>
              </li>
            </ul>
          </div>

          {/* Market Newsletter */}
          <div>
            <h3 className="text-xs font-heading font-bold text-gold-400 uppercase tracking-wider mb-4">
              Market Intelligence
            </h3>
            <p className="text-xs text-navy-300 mb-4 leading-relaxed font-sans">
              Receive exclusive off-market listings, price trends, and verified investment opportunities.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-navy-800 border border-navy-700 rounded-lg text-sm text-white placeholder-navy-400 focus:outline-none focus:border-gold-500 transition font-sans"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center space-x-2 border border-forest-600 shadow-subtle"
              >
                <span>Subscribe to Briefing</span>
                <Send className="w-3.5 h-3.5" />
              </button>
              {subscribed && (
                <p className="text-xs text-forest-300 font-medium pt-1 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest-400" />
                  <span>Subscribed to market briefing successfully.</span>
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-400 font-sans gap-4">
          <p>© 2026 HomeHub Real Estate Marketplace. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-ivory-100 transition-colors">Terms of Service</Link>
            <Link to="/about" className="hover:text-ivory-100 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-ivory-100 transition-colors">RERA Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

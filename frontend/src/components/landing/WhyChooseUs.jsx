import React from "react";
import { ShieldCheck, Bot, Zap, Headphones } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    { icon: Bot, title: "Intelligent Matching", desc: "Proprietary algorithms that curate properties matching your exact spatial and lifestyle criteria." },
    { icon: ShieldCheck, title: "100% Verified Portfolios", desc: "Every luxury listing and certified advisory partner undergoes rigorous verification." },
    { icon: Zap, title: "Instant Site Inquiries", desc: "Schedule exclusive private viewings seamlessly without intermediary friction." },
    { icon: Headphones, title: "Dedicated Advisory", desc: "Experienced real estate advisors available to provide discreet, comprehensive guidance." }
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-ivory-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">
            The HomeHub Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy-900 mt-2">
            Engineered for Discerning Buyers & Sellers
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-8 bg-ivory-50 rounded-2xl border border-ivory-300 shadow-subtle hover:shadow-card transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-navy-900">{feat.title}</h3>
                <p className="text-sm text-navy-600 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

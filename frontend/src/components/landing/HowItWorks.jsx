import React from "react";
import { Search, Home, MessageSquare, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: Search,
      title: "1. Curate",
      desc: "Search hundreds of verified architectural residences and estates with refined filters.",
    },
    {
      id: 2,
      icon: Home,
      title: "2. Evaluate",
      desc: "Explore high-definition media, floor plans, and intelligent lifestyle compatibility matches.",
    },
    {
      id: 3,
      icon: MessageSquare,
      title: "3. Connect",
      desc: "Engage with certified advisors or verified owners for private viewings and inquiries.",
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "4. Acquire",
      desc: "Complete documentation and acquisitions with transparent, professional advisory support.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-ivory-100 border-t border-b border-ivory-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Centered Title & Subtitle */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">
            Streamlined Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy-900">
            How HomeHub Works
          </h2>
          <p className="text-sm text-navy-600 font-medium">
            A seamless, transparent approach to acquiring premier properties.
          </p>
        </div>

        {/* 4 Steps Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="text-center space-y-4 p-6 rounded-2xl bg-white border border-ivory-300 shadow-subtle hover:shadow-card transition-all">
                <div className="w-14 h-14 mx-auto bg-forest-50 text-forest-700 border border-forest-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-extrabold text-base text-navy-900">{step.title}</h3>
                <p className="text-xs text-navy-600 leading-relaxed font-normal">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

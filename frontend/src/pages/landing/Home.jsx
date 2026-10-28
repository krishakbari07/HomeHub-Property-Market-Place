import React from "react";
import HeroSection from "../../components/landing/HeroSection";
import FeaturedProperties from "../../components/landing/FeaturedProperties";
import AIRecommendationSection from "../../components/landing/AIRecommendationSection";
import PopularLocations from "../../components/landing/PopularLocations";
import HowItWorks from "../../components/landing/HowItWorks";
import WhyChooseUs from "../../components/landing/WhyChooseUs";
import CTASection from "../../components/landing/CTASection";

const Home = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <FeaturedProperties />
      <AIRecommendationSection />
      <PopularLocations />
      <HowItWorks />
      <WhyChooseUs />
      <CTASection />
    </div>
  );
};

export default Home;

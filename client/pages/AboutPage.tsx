import React from "react";
import AboutHero from "../components/about/AboutHero";
import AboutSteps from "../components/about/AboutSteps";
import AboutUnfairAdvantage from "../components/about/AboutUnfairAdvantage";
import AboutScrollAnimation from "../components/about/AboutScrollAnimation";
import AboutWhatWeCheck from "../components/about/AboutWhatWeCheck";
import AboutBanner from "../components/about/AboutBanner";
import Footer from "../components/Footer";

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FFFEF9] font-sans relative min-w-0 overflow-x-hidden">
      <AboutHero />
      <AboutSteps />
      <AboutUnfairAdvantage />
      <AboutScrollAnimation />
      <AboutWhatWeCheck />
      <AboutBanner />
      <Footer />
    </div>
  );
};

export default AboutPage;

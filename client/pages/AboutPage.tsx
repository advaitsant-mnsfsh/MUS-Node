import React from 'react';
import PricingFooter from '../components/pricing/PricingFooter';
import AboutHero from '../components/about/AboutHero';
import AboutSteps from '../components/about/AboutSteps';
import AboutUnfairAdvantage from '../components/about/AboutUnfairAdvantage';
import AboutScrollAnimation from '../components/about/AboutScrollAnimation';
import AboutWhatWeCheck from '../components/about/AboutWhatWeCheck';
import AboutBanner from '../components/about/AboutBanner';

export const AboutPage: React.FC = () => {
    return (
        <div className="bg-[#FFFEF9] font-sans relative">
            <AboutHero />
            <AboutSteps />
            <AboutUnfairAdvantage />
            <AboutScrollAnimation />
            <AboutWhatWeCheck />
            <AboutBanner />
            <PricingFooter />
        </div>
    );
};

export default AboutPage;

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const YOU_TEXTS = ['Heuristics', 'Cognitive Biases', 'Mental Models', 'User Experience', 'Information Architecture', 'Interaction Design', 'Visual Hierarchy', 'Prototyping Techniques', 'Usability Testing'];
const YOU_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const THEM_TEXTS = ['Heuristics', 'Cognitive Biases', 'Mental Models', 'User Experience', 'Information Architecture', 'Usability Testing'];
const THEM_NUMBERS = [1, 2, 3, 4, 5, 6];

const AnimatedMeter = ({ title, numbers, texts, isYou, inView }: { title: string, numbers: number[], texts: string[], isYou: boolean, inView: boolean }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (inView) {
            const t = setTimeout(() => {
                setActiveIndex(numbers.length - 1);
            }, 300);
            return () => clearTimeout(t);
        } else {
            setActiveIndex(0);
        }
    }, [inView, numbers.length]);

    const currentScore = numbers[activeIndex];
    const fillPercent = currentScore / 10;
    const circum = 141.37;
    const offset = circum * (1 - fillPercent);

    return (
        <div className={`flex flex-col items-center justify-center flex-1 w-full pt-8 pb-4 ${!isYou ? 'opacity-80' : 'opacity-100'}`}>
            <h4 className={`text-[#1A1A1A] text-[1.25rem] md:text-[1.5rem] font-bold tracking-wide mb-8 ${!isYou ? 'opacity-60' : ''}`}>
                {title}
            </h4>

            {/* Meter & Number */}
            <div className="relative w-[12rem] h-[6rem] flex justify-center">
                <svg viewBox="0 0 100 50" className="w-[10rem] absolute top-0 left-1/2 -translate-x-1/2 overflow-visible">
                    <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="rgba(26,26,26,0.15)" strokeWidth="10" />
                    <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke={isYou ? '#1A1A1A' : 'rgba(26,26,26,0.3)'} strokeWidth="10" strokeDasharray={circum} strokeDashoffset={offset} className="transition-all duration-[2000ms] ease-out" />
                </svg>

                {/* Number Slot Machine */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <div className="h-[4rem] overflow-hidden">
                        <div className="flex flex-col transition-transform duration-[2000ms] ease-out" style={{ transform: `translateY(-${activeIndex * 4}rem)` }}>
                            {numbers.map((num, i) => (
                                <div key={i} className={`h-[4rem] flex flex-col items-center justify-center text-[#1A1A1A] font-bold text-[3.5rem] leading-none ${!isYou && i === numbers.length - 1 ? 'opacity-50' : ''}`}>
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Text Slot Machine */}
            <div className="h-[1.5rem] overflow-hidden mt-6">
                <div className="flex flex-col transition-transform duration-[2000ms] ease-out" style={{ transform: `translateY(-${activeIndex * 1.5}rem)` }}>
                    {texts.map((t, i) => (
                        <div key={i} className={`h-[1.5rem] flex items-center justify-center text-[#1A1A1A] font-bold text-[0.875rem] md:text-[1rem] leading-none ${!isYou && i === texts.length - 1 ? 'opacity-50' : 'opacity-80'}`}>
                            {t}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AdvantageTwoAnimation = ({ onMouseEnter }: { onMouseEnter?: () => void }) => {
    const [inView, setInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setInView(true);
            }
        }, { threshold: 0.5 });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} onMouseEnter={onMouseEnter} className="flex-1 self-stretch flex items-end justify-start bg-[#FBD24E] min-h-[500px] md:min-h-[600px] rounded-sm relative overflow-hidden pt-[4rem]">
            {/* Image container holds proportion to let badge sit relative to it */}
            <div className="relative w-[90%] md:w-[85%] flex justify-start items-end">

                {/* The Animated Logo Badge */}
                <div
                    className={`absolute z-20 flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 md:py-2 transition-all duration-1000 ease-out border-2 border-dashed w-[11rem] md:w-[13rem] h-[2.5rem] md:h-[3rem]
                    ${inView ? 'translate-y-0 translate-x-0 bg-[#FBD24E] border-[#1A1A1A] text-[#1A1A1A] shadow-md scale-100' : '-translate-y-[200%] md:-translate-y-[250%] translate-x-[10%] bg-white/70 border-gray-400 text-gray-500 scale-110'}`}
                    style={{
                        top: '10.5%', // Target Y relative to the image where 'myuxscore' logo sits
                        right: '7.5%', // Target X relative to the right structural edge
                    }}
                >
                    {/* The Triangle Logo Icon */}
                    <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent transition-colors duration-1000 ${inView ? 'border-b-[#1A1A1A]' : 'border-b-gray-400'}`}></div>
                    <span className="font-bold text-[0.875rem] md:text-[1.125rem] tracking-tight whitespace-nowrap">YOUR LOGO</span>
                </div>

                <img
                    src="/About Page/about-2nd-adv.png"
                    alt="Branded Report"
                    className="w-full h-auto object-cover object-top shadow-xl relative z-10"
                />
            </div>
        </div>
    );
};


const AdvantageThreeAnimation = ({ onMouseEnter }: { onMouseEnter?: () => void }) => {
    const [step, setStep] = useState(0); // 0: initial right, 1: unscaled center, 2: scaled center swapped
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && step === 0) {
                // Initial delay before sliding in
                setTimeout(() => setStep(1), 200);
            }
        }, { threshold: 0.5 });

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (step === 1) {
            // Step 2: Scale down (stay yellow)
            const timer = setTimeout(() => setStep(2), 1200);
            return () => clearTimeout(timer);
        }
        if (step === 2) {
            // Step 3: Morph to Cyan and Dark BG
            const timer = setTimeout(() => setStep(3), 1000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div ref={containerRef} onMouseEnter={onMouseEnter} className="flex-1 self-stretch flex items-center justify-center bg-[#FBD24E] min-h-[500px] md:min-h-[600px] rounded-sm relative overflow-hidden">
            {/* Animation Container */}
            <div className="relative w-full max-w-[40rem] aspect-[4/3] mx-auto flex items-center justify-center">

                {/* 1. Browser Frame (Slides from Right to Center) */}
                <div
                    className={`absolute z-10 bg-[#363636] rounded-t-xl shadow-2xl overflow-hidden flex flex-col transition-transform duration-1000 ease-out items-start
                    ${step > 0 ? 'translate-x-[5%] md:translate-x-0' : 'translate-x-[60%]'}
                    w-[30.101rem] h-[23.51644rem]`}
                >
                    {/* Mac Browser Header */}
                    <div className="bg-[#F6F6F6] w-full px-4 py-3 flex items-center border-b border-gray-300">
                        <div className="flex gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]"></div>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="bg-[#E9E9E9] rounded-md px-12 py-1.5 text-[0.75rem] text-[#8C8C8C] flex items-center gap-2 font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                yoursite.com
                            </div>
                        </div>
                        <div className="flex gap-3 text-[#8C8C8C]">
                            <div className="w-4 h-4">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            </div>
                            <div className="w-4 h-4">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Browser Content */}
                    <div className="w-full flex-1 relative flex flex-col items-center justify-start pt-[2rem]">
                        <div className={`bg-[#5AC8FA] p-[0.625rem] rounded-[4rem] shadow-sm mb-4 inline-flex justify-center items-center gap-[0.625rem] transition-transform duration-1000
                            ${step < 2 ? 'scale-90' : 'scale-100'}`}>
                            <span className="text-[#3D3D3D] font-black text-[1.5rem] tracking-tight">Your Design Agency</span>
                        </div>
                    </div>
                </div>

                <div
                    className={`absolute z-20 flex flex-col items-start transition-all duration-1000 ease-in-out origin-center w-[32.80406rem]
                    ${step === 0
                            ? '-translate-x-[80%] scale-100 opacity-100 bg-white rounded-[1.2rem] border-[2px] border-[#1A1A1A] p-[1.65888rem] gap-[0.82944rem] shadow-[0_20px_80px_rgba(0,0,0,0.15)] mt-0'
                            : step === 1
                                ? 'translate-x-[0%] scale-100 opacity-100 bg-white rounded-[1.2rem] border-[2px] border-[#1A1A1A] p-[1.65888rem] gap-[0.82944rem] shadow-[0_30px_90px_rgba(0,0,0,0.25)] mt-[2.5rem]'
                                : step === 2
                                    ? 'translate-x-[0%] scale-50 opacity-100 bg-white rounded-[1.2rem] border-[2px] border-[#1A1A1A] p-[1.65888rem] gap-[0.82944rem] shadow-none mt-[4.5rem]'
                                    : 'translate-x-[0%] scale-50 opacity-100 bg-[#363636] rounded-[1.2rem] border-[4px] border-[#5AC8FA] p-[1.65888rem] gap-[0.82944rem] shadow-[0_2px_18px_rgba(90,200,250,0.15)] mt-[4.5rem]'
                        }`}
                >
                    {/* Input Field Mock */}
                    <div className={`w-full flex items-center overflow-hidden transition-all duration-1000 origin-center 
                        ${step < 3 ? 'bg-white rounded-[0.5rem] border-[2px] border-[#1A1A1A]' : 'bg-white rounded-[0.5rem] border-[4px] border-[#5AC8FA]'}
                    `}>
                        <div className="flex-1 px-5 py-3 text-left text-[#A1A1AA] text-[1.2rem] font-medium truncate">
                            www.yourwebsite.com
                        </div>
                        <div className="px-4 flex items-center gap-4">
                            <div className="w-6 h-6 text-gray-500">
                                <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2H4zm16 12H4V7h16v10zm-8.5-5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 16h14l-4.5-6-3.5 4-2.5-3L5 16z"></path><path d="M19 3v2h2v-2h-2z" fill="#000" /><path d="M19 1h-2v2h2V1zM23 3h-2v2h2V3zM21 1h-2v2h2V1z" fill="#000" /></svg>
                            </div>
                            <div className="border border-gray-400 p-1 w-8 h-8 flex items-center justify-center text-gray-500 transition-all duration-1000 rounded border-[2px]">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Button Mock */}
                    <div className={`w-full font-bold text-center cursor-pointer transition-all duration-1000
                        ${step < 3
                            ? 'bg-[#FBD24E] text-[#1A1A1A] py-4 text-[1.2rem] rounded-[0.5rem] border-[2px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]'
                            : 'bg-[#5AC8FA] text-[#1A1A1A] py-4 text-[1.2rem] rounded-[0.5rem] border-[4px] border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]'}
                    `}>
                        {step < 3 ? 'Start Assessment' : 'Start Assessment'}
                    </div>

                    {/* Mini Logo Mock */}
                    <div className={`w-full text-center tracking-tight transition-all duration-1000 mt-1 text-[1.1rem]
                        ${step < 3 ? 'font-normal text-[#1A1A1A]' : 'font-medium text-[#5AC8FA]'}
                    `}>
                        my<span className="font-bold tracking-tight">ux</span>score
                    </div>
                </div>
            </div>
        </div>
    );
};

const AboutUnfairAdvantage: React.FC = () => {
    const [inView, setInView] = useState(false);
    const [animKey1, setAnimKey1] = useState(0);
    const [animKey2, setAnimKey2] = useState(0);
    const [animKey3, setAnimKey3] = useState(0);

    // Animation locks to prevent hover spamming ("Let it finish" approach)
    const [isAnimating1, setIsAnimating1] = useState(false);
    const [isAnimating2, setIsAnimating2] = useState(false);
    const [isAnimating3, setIsAnimating3] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !inView) {
                setInView(true);
                // Lock the first animation play
                setIsAnimating1(true);
                setTimeout(() => setIsAnimating1(false), 2500);
            }
        }, { threshold: 0.4 });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [inView]);

    const handleHover1 = () => {
        if (isAnimating1) return;
        setIsAnimating1(true);
        setAnimKey1(k => k + 1);
        setTimeout(() => setIsAnimating1(false), 2500);
    };

    const handleHover2 = () => {
        if (isAnimating2) return;
        setIsAnimating2(true);
        setAnimKey2(k => k + 1);
        setTimeout(() => setIsAnimating2(false), 1500);
    };

    const handleHover3 = () => {
        if (isAnimating3) return;
        setIsAnimating3(true);
        setAnimKey3(k => k + 1);
        setTimeout(() => setIsAnimating3(false), 3600);
    };

    return (
        <section className="relative w-full bg-[#FFFEF9] py-20 px-6 font-['DM_Sans']">
            <div className="flex flex-col items-center gap-16 self-stretch w-full max-w-[1271px] mx-auto">
                {/* Main Section Heading */}
                <h2 className="text-[#1A1A1A] text-center text-[2.5rem] font-bold tracking-tight m-0">
                    Your New Unfair Advantages
                </h2>

                {/* Advantage 1 Container */}
                <div className="flex flex-col md:flex-row w-full gap-8 md:gap-12 items-stretch" ref={containerRef}>
                    {/* Left: Text Content */}
                    <div className="flex flex-col justify-center items-start gap-[3rem] p-0 md:p-[3rem_1.5rem] flex-1 self-stretch">

                        {/* Heading & Subheading Parent */}
                        <div className="flex flex-col items-start gap-[1rem] self-stretch">
                            <h3 className="text-[#1A1A1A] text-[2.25rem] font-bold leading-tight m-0">
                                Want to know where you really stand?
                            </h3>
                            <p className="text-[#1A1A1A] text-[1rem] font-semibold leading-normal m-0 opacity-80">
                                Compare your UX against prime competitors in your industry.
                            </p>
                        </div>

                        {/* Description Paragraph */}
                        <p className="text-[#1A1A1A] text-[1rem] font-normal leading-relaxed m-0 opacity-70">
                            Our competitive audits help you find where your competitors are doing better and what advantages you have over them. We quantify these differences and give you plan to act on them.
                        </p>
                    </div>

                    {/* Right: Animation Box — hover remounts meters (locked until animation finishes) */}
                    <motion.div
                        className="flex-1 self-stretch flex items-center justify-center bg-[#FBD24E] min-h-[500px] md:min-h-[600px] rounded-sm py-12 px-2"
                        onMouseEnter={handleHover1}
                    >
                        <div key={animKey1} className="flex w-full max-w-[32rem] mx-auto items-center">
                            <AnimatedMeter title="YOU" numbers={YOU_NUMBERS} texts={YOU_TEXTS} isYou={true} inView={inView} />

                            {/* Divider */}
                            <div className="w-[1px] self-stretch min-h-[200px] bg-[#1A1A1A] opacity-20 mx-4 md:mx-0"></div>

                            <AnimatedMeter title="THEM" numbers={THEM_NUMBERS} texts={THEM_TEXTS} isYou={false} inView={inView} />
                        </div>
                    </motion.div>
                </div>

                {/* Advantage 2 Container */}
                <div className="flex flex-col md:flex-row w-full gap-8 md:gap-12 items-stretch mt-8 md:mt-12">
                    {/* Left: Text Content */}
                    <div className="flex flex-col justify-center items-start gap-[3rem] p-0 md:p-[3rem_1.5rem] flex-1 self-stretch">

                        {/* Heading & Subheading Parent */}
                        <div className="flex flex-col items-start gap-[1rem] self-stretch">
                            <h3 className="text-[#1A1A1A] text-[2.25rem] font-bold leading-tight m-0">
                                Your Brand. Your Report.<br />Our Engine.
                            </h3>
                            <p className="text-[#1A1A1A] text-[1rem] font-semibold leading-normal m-0 opacity-80">
                                You get a fully branded, client-ready report that solidifies your authority
                            </p>
                        </div>

                        {/* Description Paragraph */}
                        <p className="text-[#1A1A1A] text-[1rem] font-normal leading-relaxed m-0 opacity-70">
                            Our enterprise level subscription allows you to brand your reports for client use and documentation
                        </p>
                    </div>

                    {/* Right: Animation Box (Image Overlay) */}
                    <AdvantageTwoAnimation key={animKey2} onMouseEnter={handleHover2} />
                </div>

                {/* Advantage 3 Container */}
                <div className="flex flex-col md:flex-row w-full gap-8 md:gap-12 items-stretch mt-8 md:mt-12">
                    {/* Left: Text Content */}
                    <div className="flex flex-col justify-center items-start gap-[3rem] p-0 md:p-[3rem_1.5rem] flex-1 self-stretch">

                        {/* Heading & Subheading Parent */}
                        <div className="flex flex-col items-start gap-[1rem] self-stretch">
                            <h3 className="text-[#1A1A1A] text-[2.25rem] font-bold leading-tight m-0">
                                Turn Visitors into Paying Clients
                            </h3>
                            <p className="text-[#1A1A1A] text-[1rem] font-semibold leading-normal m-0 opacity-80">
                                Embed our audit tool on your site to deliver value and secure leads.
                            </p>
                        </div>

                        {/* Description Paragraph */}
                        <p className="text-[#1A1A1A] text-[1rem] font-normal leading-relaxed m-0 opacity-70">
                            Our competitive audits help you find where your competitors are doing better and what advantages you have over them. We quantify these differences and give you plan to act on them.
                        </p>
                    </div>

                    {/* Right: Animation Box (Interactive Widget) */}
                    <AdvantageThreeAnimation key={animKey3} onMouseEnter={handleHover3} />
                </div>
            </div>
        </section>
    );
};

export default AboutUnfairAdvantage;

import React from 'react';

const cards = [
    {
        title: 'Strategy & Positioning',
        description: 'We ensure customers immediately understand what you offer and why they should choose you.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="10" stroke="white" strokeWidth="2" />
                <circle cx="14" cy="14" r="5" stroke="white" strokeWidth="2" />
                <circle cx="14" cy="14" r="1.5" fill="white" />
                <line x1="14" y1="4" x2="14" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="14" y1="28" x2="14" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="14" x2="0" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="28" y1="14" x2="24" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        title: 'User Experience (UX)',
        description: 'We pinpoint exactly where users get confused, frustrated, or stuck before they can finish a task.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="9" r="4" stroke="white" strokeWidth="2" />
                <circle cx="21" cy="9" r="3" stroke="white" strokeWidth="2" />
                <path d="M2 24C2 19.582 5.582 16 10 16C14.418 16 18 19.582 18 24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M21 15C23.761 15 26 17.239 26 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        title: 'Visual Design',
        description: 'We check if your design looks professional, guides the eye to the important stuff, and builds trust.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="2" />
                <circle cx="9" cy="11" r="2" fill="white" />
                <circle cx="19" cy="11" r="2" fill="white" />
                <circle cx="14" cy="18" r="2" fill="white" />
                <path d="M9 11 Q14 6 19 11" stroke="white" strokeWidth="1.5" fill="none" />
                <path d="M9 11 Q7 16 14 18" stroke="white" strokeWidth="1.5" fill="none" />
                <path d="M19 11 Q21 16 14 18" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
        ),
    },
    {
        title: 'Accessibility and Inclusion',
        description: 'We verify that your site works for people with disabilities, keeping you compliant with regulations.',
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 3L24 7.5V14C24 19.5 19.5 24.5 14 26C8.5 24.5 4 19.5 4 14V7.5L14 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M10 14L13 17L18 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

const AboutWhatWeCheck: React.FC = () => {
    return (
        <section className="relative w-full bg-[#FFFEF9] pt-0 pb-20">

            {/* Yellow arc — full viewport width, no clipping */}
            <div
                style={{
                    position: 'relative',
                    width: '100vw',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    lineHeight: 0,
                }}
            >
                <svg
                    viewBox="0 0 1200 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '100%', display: 'block' }}
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 180 Q600 -60 1200 180"
                        stroke="#F8D448"
                        strokeWidth="4"
                        fill="none"
                    />
                </svg>
            </div>

            {/* Heading */}
            <div className="text-center mt-8 mb-4 px-4">
                <h2 className="text-[2rem] md:text-[2rem] font-extrabold text-[#1A1A1A]">What We Check</h2>
                <p className="mt-3 text-[0.95rem] md:text-[1rem] text-[#555] font-normal max-w-[33rem] mx-auto leading-relaxed">
                    We dig deeper than surface-level metrics.&nbsp; Our AI Agents calculate up
                    <br />to 110+ specific parameters across:
                </p>
            </div>

            {/* 4 Cards */}
            <div className="mt-10 px-6 md:px-16 w-fit  mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-[#FFEFB266] p-5 flex flex-col justify-between items-start flex-1 self-stretch"
                        style={{ height: '19.625rem', width: '17.5rem' }}
                    >
                        {/* Icon circle */}
                        <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                            <div className="scale-125">
                                {card.icon}
                            </div>
                        </div>

                        {/* Text at bottom */}
                        <div className="mt-8 w-full">
                            <h3 className="text-[1.125rem] font-bold text-[#1A1A1A] mb-2 leading-tight">{card.title}</h3>
                            <p className="text-[1rem] font-normal text-[#555] leading-relaxed">{card.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AboutWhatWeCheck;

import React from 'react';

const cards = [
    {
        title: 'Strategy & Positioning',
        description: 'We ensure customers immediately understand what you offer and why they should choose you.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M18 33C26.2843 33 33 26.2843 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33Z" stroke="#FAFAFA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 27C22.9706 27 27 22.9706 27 18C27 13.0294 22.9706 9 18 9C13.0294 9 9 13.0294 9 18C9 22.9706 13.0294 27 18 27Z" stroke="#FAFAFA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18C15 19.6569 16.3431 21 18 21Z" stroke="#FAFAFA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        title: 'User Experience (UX)',
        description: 'We pinpoint exactly where users get confused, frustrated, or stuck before they can finish a task.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M24 31.5V28.5C24 26.9087 23.3679 25.3826 22.2426 24.2574C21.1174 23.1321 19.5913 22.5 18 22.5H9C7.4087 22.5 5.88258 23.1321 4.75736 24.2574C3.63214 25.3826 3 26.9087 3 28.5V31.5" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.5 16.5C16.8137 16.5 19.5 13.8137 19.5 10.5C19.5 7.18629 16.8137 4.5 13.5 4.5C10.1863 4.5 7.5 7.18629 7.5 10.5C7.5 13.8137 10.1863 16.5 13.5 16.5Z" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M33 31.5003V28.5003C32.999 27.1709 32.5565 25.8795 31.742 24.8288C30.9276 23.7781 29.7872 23.0277 28.5 22.6953" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24 4.69531C25.2906 5.02576 26.4346 5.77636 27.2515 6.82878C28.0684 7.88119 28.5118 9.17556 28.5118 10.5078C28.5118 11.8401 28.0684 13.1344 27.2515 14.1868C26.4346 15.2393 25.2906 15.9899 24 16.3203" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        title: 'Visual Design',
        description: 'We check if your design looks professional, guides the eye to the important stuff, and builds trust.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M20.25 10.5C20.6642 10.5 21 10.1642 21 9.75C21 9.33579 20.6642 9 20.25 9C19.8358 9 19.5 9.33579 19.5 9.75C19.5 10.1642 19.8358 10.5 20.25 10.5Z" fill="#EDECE5" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M26.25 16.5C26.6642 16.5 27 16.1642 27 15.75C27 15.3358 26.6642 15 26.25 15C25.8358 15 25.5 15.3358 25.5 15.75C25.5 16.1642 25.8358 16.5 26.25 16.5Z" fill="#EDECE5" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.75 12C13.1642 12 13.5 11.6642 13.5 11.25C13.5 10.8358 13.1642 10.5 12.75 10.5C12.3358 10.5 12 10.8358 12 11.25C12 11.6642 12.3358 12 12.75 12Z" fill="#EDECE5" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.75 19.5C10.1642 19.5 10.5 19.1642 10.5 18.75C10.5 18.3358 10.1642 18 9.75 18C9.33579 18 9 18.3358 9 18.75C9 19.1642 9.33579 19.5 9.75 19.5Z" fill="#EDECE5" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 3C9.75 3 3 9.75 3 18C3 26.25 9.75 33 18 33C19.389 33 20.472 31.881 20.472 30.468C20.472 29.8125 20.202 29.2155 19.8165 28.7805C19.3815 28.347 19.1595 27.8025 19.1595 27.093C19.1538 26.7629 19.2146 26.435 19.3384 26.1288C19.4621 25.8227 19.6462 25.5446 19.8797 25.3112C20.1131 25.0777 20.3912 24.8936 20.6973 24.7699C21.0035 24.6461 21.3314 24.5853 21.6615 24.591H24.6555C29.232 24.591 32.988 20.8365 32.988 16.26C32.9475 9.018 26.1915 3 18 3Z" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        title: 'Accessibility and Inclusion',
        description: 'We verify that your site works for people with disabilities, keeping you compliant with regulations.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M30 19.5007C30 27.0007 24.75 30.7507 18.51 32.9257C18.1832 33.0364 17.8283 33.0311 17.505 32.9107C11.25 30.7507 6 27.0007 6 19.5007V9.00067C6 8.60285 6.15804 8.22132 6.43934 7.94001C6.72064 7.65871 7.10218 7.50067 7.5 7.50067C10.5 7.50067 14.25 5.70067 16.86 3.42067C17.1778 3.14917 17.582 3 18 3C18.418 3 18.8222 3.14917 19.14 3.42067C21.765 5.71567 25.5 7.50067 28.5 7.50067C28.8978 7.50067 29.2794 7.65871 29.5607 7.94001C29.842 8.22132 30 8.60285 30 9.00067V19.5007Z" stroke="#EDECE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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

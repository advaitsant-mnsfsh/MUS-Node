import React from 'react';

const AboutBanner: React.FC = () => {
    return (
        <section className="w-full flex flex-col items-center justify-center text-center py-24 px-6">

            {/* Headline */}
            <h2 className="text-[2rem] md:text-[2.6rem] font-extrabold text-[#1A1A1A] leading-snug max-w-[620px]">
                Hear what you need to. No BS.<br />
                Just Actionable Insights.
            </h2>

            {/* CTA Button */}
            <a
                href="#"
                className="mt-10 inline-flex items-center gap-2 bg-[#F8D448] border-2 border-[#1A1A1A] px-6 py-3 text-[0.95rem] font-semibold text-[#1A1A1A] hover:bg-[#f0c930] transition-colors"
                style={{ boxShadow: '2px 2px 0px #000' }}
            >
                Get Your Score Now
                <span className="w-6 h-6 bg-[#F8D448] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M16.2 12L10.8 6.6L9.12 8.31L12.81 12L9.12 15.69L10.8 17.4L16.2 12ZM24 12C24 13.66 23.685 15.22 23.055 16.68C22.425 18.14 21.57 19.41 20.49 20.49C19.41 21.57 18.14 22.425 16.68 23.055C15.22 23.685 13.66 24 12 24C10.34 24 8.78 23.685 7.32 23.055C5.86 22.425 4.59 21.57 3.51 20.49C2.43 19.41 1.575 18.14 0.945 16.68C0.315 15.22 0 13.66 0 12C0 10.34 0.315 8.78 0.945 7.32C1.575 5.86 2.43 4.59 3.51 3.51C4.59 2.43 5.86 1.575 7.32 0.945C8.78 0.315001 10.34 0 12 0C13.66 0 15.22 0.315001 16.68 0.945C18.14 1.575 19.41 2.43 20.49 3.51C21.57 4.59 22.425 5.86 23.055 7.32C23.685 8.78 24 10.34 24 12Z" fill="#1A1A1A" />
                    </svg>
                </span>
            </a>
        </section>
    );
};

export default AboutBanner;

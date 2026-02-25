import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

/**
 * PricingFAQ Component
 */
const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(4);

    const faqs = [
        {
            question: "Why conduct a UX audit?",
            answerDetail: "A UX audit is conducted to systematically assess the strengths and weaknesses of your digital product’s user experience. An audit helps you identify usability issues, enhance accessibility, and get actionable recommendations from experts, to ensure that your product aligns with your user needs and business goals while improving overall satisfaction and engagement."
        },
        {
            question: "When would be the best time to perform an audit and why?",
            answerDetail: "The best time to perform an audit is during the early stages of a project, post-major updates, or before a significant redesign. This allows for proactive identification of issues, ensuring a solid foundation for usability and accessibility as the project evolves."
        },
        {
            question: "Can I use this on a live site?",
            answerHeader: "Yes.",
            answerDetail: "Our audit is non-intrusive. We analyze the DOM (code structure) and the visual render. We do not track your users, we do not slow down your site, and we do not break anything. We simply observe and score."
        },
        {
            question: "What types of digital products are suitable for a UX audit?",
            answerDetail: "Any digital product across domains such as healthcare, fintech, edtech, cybersecurity, travel & hospitality, agritech, government & non-profits, etc. are suitable for getting a UX audit."
        },
        {
            question: "Will this replace my design team?",
            answerHeader: "No. It will stop them from arguing.",
            answerDetail: "Designers waste hours debating subjective preferences. We give them objective data so they can skip the debate and focus on solving the problem. We are not the artist; we are the spellcheck for their logic."
        },
        {
            question: "What exactly do I get in the report?",
            answerHeader: "A list of what is broken, ranked by how much it costs you.",
            answerDetail: "You don't get a philosophical essay. You get a prioritized roadmap of friction points—rated by severity—so your dev team knows exactly what to fix first to stop the revenue bleeding."
        }
    ];

    return (
        <section className="mt-40 w-full max-w-[1440px] mx-auto px-8 lg:px-[144px] pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-28">
                <div className="lg:col-span-4">
                    <p className="text-base font-medium text-gray-500 mb-2 uppercase tracking-widest">FAQs</p>
                    <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                        Still have Questions?
                    </h2>
                </div>

                <div className="lg:col-span-8 space-y-2">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className="border-b border-gray-100 last:border-none">
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full py-6 flex items-start gap-6 text-left group"
                                >
                                    <div className={`
                    mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors
                    ${isOpen ? 'bg-black text-white' : 'bg-gray-300 text-gray-600 group-hover:bg-gray-400'}
                  `}>

                                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </div>
                                    <span className={`text-xl font-medium transition-colors ${isOpen ? 'text-black' : 'text-gray-500 group-hover:text-gray-800'}`}>
                                        {faq.question}
                                    </span>
                                </button>

                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="pl-14 pb-10 max-w-2xl">
                                            {faq.answerHeader && (
                                                <p className="text-xl font-bold text-gray-800 mb-3">
                                                    {faq.answerHeader}
                                                </p>
                                            )}
                                            {faq.answerDetail && (
                                                <p className="text-base text-gray-500 leading-relaxed font-medium">
                                                    {faq.answerDetail}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;

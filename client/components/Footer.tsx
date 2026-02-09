import React from 'react';


export const Footer: React.FC = () => {


    return (
        <footer className="bg-white border-t border-slate-200 mt-auto font-['DM_Sans']">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Author Details */}
                {/* Author Details - Profile Card */}
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Badge: A PRODUCT BY */}
                    <div className="inline-block bg-[#FEF08A] border-2 border-black px-3 py-1 shadow-neo-hover transform -rotate-2 hover:rotate-0 transition-transform duration-200 cursor-default">
                        <p className="text-xs font-black tracking-widest text-black uppercase">A Product By</p>
                    </div>

                    {/* Name */}
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight mt-2 mb-1">
                        Shravani Joshi
                    </h3>

                    {/* Roles - Neo-Brutalist Pills */}
                    <div className="flex flex-wrap justify-center items-center gap-3 text-sm font-bold">
                        <span className="bg-[#DCFCE7] border-2 border-black px-3 py-1.5 shadow-neo-hover hover:translate-y-0.5 hover:shadow-none transition-all cursor-default">
                            Co-Founder @Myuxscore
                        </span>
                        <span className="bg-[#DCFCE7] border-2 border-black px-3 py-1.5 shadow-neo-hover hover:translate-y-0.5 hover:shadow-none transition-all cursor-default">
                            Studio Head @Monsoonfish
                        </span>
                    </div>

                    {/* Credentials */}
                    <div className="flex items-center gap-2 text-sm pt-2">
                        <span className="font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 border-b-2 border-indigo-600">NID ADI</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-600">Expert UX Auditor</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
